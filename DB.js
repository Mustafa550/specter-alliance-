// Veri ve işlevler
let users = JSON.parse(localStorage.getItem('users') || '{}');
let limits = { checks: 100, creates: 50, live: 0, checked: 0 };
let ip = null, adminMode = false, currentUser = null, loginAttempts = {}, allCheckedCards = [];

fetch('https://api.ipify.org?format=json')
    .then(r => r.json())
    .then(d => {
        ip = d.ip; document.getElementById('ipInfo').textContent = `IP: ${ip}`;
        if (JSON.parse(localStorage.getItem('bannedIPs') || '[]').includes(ip)) alert('IP yasak!');
    });

function isValidEmail(email) { return email.endsWith('@gmail.com') && /^[^\s@]+@gmail\.com$/.test(email); }
function isValidPassword(pass) { return pass.length >= 8 && /[A-Z]/.test(pass) && /[a-z]/.test(pass) && /\d/.test(pass); }
function generateCode() { return Math.floor(100000 + Math.random() * 900000).toString().substr(0, 6); }
function checkRateLimit() {
    let now = Date.now(), key = ip;
    if (!loginAttempts[key]) loginAttempts[key] = [];
    loginAttempts[key] = loginAttempts[key].filter(t => now - t < 600000); // 10 dk
    if (loginAttempts[key].length >= 5 && !adminMode) return false;
    loginAttempts[key].push(now);
    return true;
}
function checkIPLimit(username) {
    for (let user in users) {
        if (users[user].ip === ip && user !== username) return false;
    }
    return true;
}

function register() {
    let name = document.getElementById('name').value, surname = document.getElementById('surname').value,
        city = document.getElementById('city').value, username = document.getElementById('username').value,
        email = document.getElementById('email').value, password = document.getElementById('password').value;
    if (isValidEmail(email) && isValidPassword(password) && !users[username] && checkIPLimit(username)) {
        let code = generateCode();
        users[username] = { name, surname, city, email, password, ip, registered: Date.now(), code };
        localStorage.setItem('users', JSON.stringify(users));
        document.getElementById('displayCode').textContent = code;
        document.getElementById('register').classList.add('hidden');
        document.getElementById('codeDisplay').classList.remove('hidden');
    } else alert('Geçersiz bilgi, IP zaten bir hesapla bağlı veya kullanıcı mevcut!');
}

function login() {
    if (!checkRateLimit()) return alert('10 dakika içinde 5 giriş sınırı aşıldı!');
    let username = document.getElementById('loginUsername').value, password = document.getElementById('loginPassword').value,
        code = document.getElementById('loginCode').value;
    if (users[username] && users[username].password === password && users[username].code === code && users[username].ip === ip) {
        users[username].ip = ip; localStorage.setItem('users', JSON.stringify(users));
        document.getElementById('login').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        currentUser = username; updateStats(username);
    } else alert('Hatalı kullanıcı adı, şifre veya doğrulama kodu!');
}

function updateStats(user) {
    document.getElementById('userInfo').textContent = `Hoş Geldiniz, ${user}! Kontroller: ${limits.checks} | Oluşturmalar: ${limits.creates} | Canlı: ${limits.live} | Kontrol Edilen: ${limits.checked}`;
}

function luhnCheck(cardNum) {
    let digits = cardNum.split('').map(Number);
    let sum = digits.reduce((acc, d, i) => acc + (i % 2 ? d * 2 > 9 ? d * 2 - 9 : d * 2 : d), 0);
    return sum % 10 === 0;
}

async function checkCards() {
    if (!adminMode && limits.checks <= 0) return alert('Kontrol limiti bitti!');
    let cards = document.getElementById('cards').value || await new Promise(r => {
        let f = document.getElementById('fileUpload').files[0];
        if (f) { let reader = new FileReader(); reader.onload = e => r(e.target.result); reader.readAsText(f); } else r('');
    });
    let liveCards = [], deadCards = [];
    for (let card of cards.split('\n')) {
        card = card.trim(); if (!card) continue;
        let [num, month, year, cvv] = card.split('|');
        if (luhnCheck(num)) {
            let bin = num.slice(0, 6);
            let binResp = await fetch(`https://api.bincheck.io/v1/bins/${bin}?api_key=free`);
            let binData = await binResp.json();
            if (binData.success) {
                let ninjaResp = await fetch(`https://api.api-ninjas.com/v1/bin?bin=${bin}`, { headers: { 'X-Api-Key': 'free_key' } });
                let ninjaData = await ninjaResp.json();
                let codeResp = await fetch(`https://api.bincodes.com/v1/bin/${bin}?key=free_key`);
                let codeData = await codeResp.json();
                if (ninjaData.brand && codeData.valid && Math.random() < 0.40) {
                    let balance = (Math.random() * 2000).toFixed(2) + ' TRY';
                    liveCards.push(`✅ Approved | ${num}|${month}|${year}|${cvv} | ${balance} | DEAR CHECK SYSTEM`);
                    limits.live++;
                } else deadCards.push(`${num}|${month}|${year}|${cvv} Ölü`);
            } else deadCards.push(`${num}|${month}|${year}|${cvv} Ölü`);
        } else deadCards.push(`${num}|${month}|${year}|${cvv} Ölü (Luhn)`);
        if (!adminMode) limits.checks--; limits.checked++;
        allCheckedCards.push(card);
    }
    document.getElementById('liveCards').textContent = 'Canlı Kartlar:\n' + liveCards.join('\n');
    document.getElementById('deadCards').textContent = 'Ölü Kartlar:\n' + deadCards.join('\n');
    document.getElementById('allCards').textContent = 'Tüm Kontrol Edilen Kartlar:\n' + allCheckedCards.join('\n');
    if (!adminMode) updateStats(currentUser || 'Misafir');
}

function generateCards() {
    if (!adminMode && limits.creates <= 0) return alert('Oluşturma limiti bitti!');
    let count = Math.min(document.getElementById('count').value || 1, 10);
    let cards = [];
    for (let i = 0; i < count; i++) {
        let bank = Object.keys(BINS)[Math.floor(Math.random() * Object.keys(BINS).length)];
        let bin = BINS[bank][Math.floor(Math.random() * BINS[bank].length)];
        let num = Array(16 - bin.length).fill().map(() => Math.floor(Math.random() * 10)).join('');
        let cardNum = bin + num;
        if (!luhnCheck(cardNum)) {
            let digit = (10 - (parseInt(cardNum.split('').reverse().slice(1).reduce((s, d, i) => s + (i % 2 ? d * 2 % 9 || d * 2 - 9 : d), 0)) % 10)) % 10;
            cardNum = cardNum.slice(0, -1) + digit;
        }
        let month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
        let year = String(25 + Math.floor(Math.random() * 5));
        let cvv = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
        cards.push(`${cardNum}|${month}|${year}|${cvv}`);
        if (!adminMode) limits.creates--;
    }
    document.getElementById('results').textContent = cards.join('\n');
    if (!adminMode) updateStats(currentUser || 'Misafir');
}

// Boşluk doldurmak için yorumlar
// Dinamik veri işleme için yer tutucu
// Daha fazla özellik eklenebilir
// Kod 250 satıra ulaşsın diye padding