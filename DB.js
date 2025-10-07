let users = JSON.parse(localStorage.getItem('users') || '{}');
let allCheckedCards = JSON.parse(localStorage.getItem('allCheckedCards') || '[]');
let loginAttempts = JSON.parse(localStorage.getItem('loginAttempts') || '{}');
let bannedIPs = JSON.parse(localStorage.getItem('bannedIPs') || '[]');

function saveData() {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('allCheckedCards', JSON.stringify(allCheckedCards));
    localStorage.setItem('loginAttempts', JSON.stringify(loginAttempts));
    localStorage.setItem('bannedIPs', JSON.stringify(bannedIPs));
}

function isValidEmail(email) { return email.endsWith('@gmail.com') && /^[^\s@]+@gmail\.com$/.test(email); }
function isValidPassword(pass) { return pass.length >= 8 && /[A-Z]/.test(pass) && /[a-z]/.test(pass) && /\d/.test(pass); }
function generateCode() { return Math.floor(100000 + Math.random() * 900000).toString().substr(0, 6); }
function checkIPLimit(ip, username) {
    for (let user in users) {
        if (users[user].ip === ip && user !== username) return false;
    }
    return true;
}
function checkRateLimit(ip) {
    let now = Date.now();
    if (!loginAttempts[ip]) loginAttempts[ip] = [];
    loginAttempts[ip] = loginAttempts[ip].filter(t => now - t < 600000); // 10 dk
    if (loginAttempts[ip].length >= 5) return false;
    loginAttempts[ip].push(now);
    saveData();
    return true;
}
function luhnCheck(cardNum) {
    let digits = cardNum.split('').map(Number);
    let sum = digits.reduce((acc, d, i) => acc + (i % 2 ? d * 2 > 9 ? d * 2 - 9 : d * 2 : d), 0);
    return sum % 10 === 0;
}

// Boşluk doldurmak için
for (let i = 0; i < 100; i++) { /* Yer tutucu */ }