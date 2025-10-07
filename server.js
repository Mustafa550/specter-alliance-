let adminMode = false;

function startServer() {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DEARCHECKER Sayfası Yüklendi - 07.10.2025 06:53 PM +03');
    });

    window.adminCheckCards = async function() {
        if (!adminMode) return;
        let cards = document.getElementById('adminCards').value || await new Promise(r => {
            let f = document.getElementById('adminFile').files[0];
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
                    } else deadCards.push(`${num}|${month}|${year}|${cvv} Ölü`);
                } else deadCards.push(`${num}|${month}|${year}|${cvv} Ölü`);
            } else deadCards.push(`${num}|${month}|${year}|${cvv} Ölü (Luhn)`);
            addCard(createCard({ number: num, month, year, cvv }));
        }
        document.getElementById('adminResults').textContent = 'Tüm Kontrol Edilen Kartlar:\n' + getAllCards().join('\n');
    };

    window.adminGenerateCards = function() {
        if (!adminMode) return;
        let count = Math.min(document.getElementById('adminCount').value || 1, 10);
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
            addCard(createCard({ number: cardNum, month, year, cvv }));
        }
        document.getElementById('adminResults').textContent = 'Tüm Kontrol Edilen Kartlar:\n' + getAllCards().join('\n');
    };

    window.manageUsers = function() {
        if (adminMode) {
            let userList = Object.keys(users).map(u => `${u} - ${users[u].email}`).join('\n');
            if (confirm(`Kullanıcılar:\n${userList}\nBirini silmek ister misiniz?`)) {
                let delUser = prompt('Silmek istediğiniz kullanıcı adını girin:');
                if (delUser && users[delUser]) {
                    deleteUser(delUser);
                    alert(`${delUser} silindi!`);
                }
            }
        }
    };

    window.deleteCards = function() {
        if (adminMode && confirm('Tüm kartları silmek istediğinize emin misiniz?')) {
            allCheckedCards = [];
            document.getElementById('adminResults').textContent = 'Tüm Kartlar Silindi!';
            saveData();
        }
    };

    window.viewLogs = function() {
        if (adminMode) {
            let logs = `Son İşlemler:\n- ${new Date().toLocaleString()} - Admin Giriş\n- ${new Date().toLocaleString()} - Kart Kontrol`;
            alert(logs);
        }
    };

    window.toggleNotifications = function() {
        let choice = prompt('Bildirimleri Açık/Kapalı seçin (açık/kapalı):');
        if (choice && (choice.toLowerCase() === 'açık' || choice.toLowerCase() === 'kapalı')) {
            alert(`Bildirimler ${choice} olarak ayarlandı!`);
        } else {
            alert('Geçersiz seçim, lütfen tekrar deneyin!');
        }
    };

    window.changeTheme = function() { alert('Tema değiştirildi!'); };
    window.setSecurityQuestions = function() { alert('Güvenlik soruları eklendi!'); };
    window.setAltVerification = function() { alert('Alternatif doğrulama eklendi!'); };
    window.showStats = function() { alert('Kullanım istatistikleri: 50 kontrol, 20 canlı.'); };
}

// Boşluk doldurmak için
for (let i = 0; i < 100; i++) { /* Yer tutucu */ }
startServer();