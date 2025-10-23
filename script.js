// Saat Gösterimi
function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    document.getElementById('clock').textContent = `Türkiye Saati: ${hours}:${minutes}:${seconds}`;
}
setInterval(updateClock, 1000);

// Sohbet Botu: Mesajlara anlamlı cevaplar
const responses = {
    "Okul hakkında bilgi istiyorum": "Reha Gündüz Aksoy Anadolu Lisesi, Gaziantep’te yer alan, disiplinli bir okuldur. Öğrencilerimize başarılı bir eğitim sunmayı hedefliyoruz.",
    "Okulun amacı nedir": "Amacımız, öğrencilerimize en iyi eğitim imkanlarını sunarak onları geleceğe hazırlamaktır.",
    "Ne tür etkinlikler yapıyorsunuz": "Okulumuzda yazılım, bilim, kültür ve spor etkinlikleri düzenlenmektedir.",
    "Okulun başarıları nelerdir": "Okulumuz, akademik başarılar, bilimsel projeler ve çeşitli etkinliklerde ödüller kazanmıştır.",
    "Merhaba": "Merhaba! Size nasıl yardımcı olabilirim?",
    "Nasılsın?": "Ben bir botum, ama teşekkür ederim! Siz nasılsınız?"
};

// Sohbet Botu Yanıtları
function addMessageToChat(userMessage, botMessage) {
    const messagesDiv = document.getElementById('chatMessages');
    messagesDiv.innerHTML += `<p><strong>Kullanıcı:</strong> ${userMessage}</p>`;
    messagesDiv.innerHTML += `<p><strong>Bot:</strong> ${botMessage}</p>`;
    messagesDiv.scrollTop = messagesDiv.scrollHeight; // Sohbeti en alta kaydır
}

// Sohbet Botunu Açma/Kapama
function toggleChatbot() {
    var chatPopup = document.getElementById('chatPopup');
    chatPopup.style.display = chatPopup.style.display === 'block' ? 'none' : 'block';
}

// Sohbet Mesajı Gönderme
document.getElementById('chatInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        let userInput = event.target.value.trim();
        if (userInput) {
            let botResponse = responses[userInput] || "Üzgünüm, bunu anlayamadım. Lütfen başka bir soru sorun.";
            addMessageToChat(userInput, botResponse);
        }
        event.target.value = ''; // Mesaj kutusunu temizle
    }
});

// Dinamik Etkileşimli Sayfa Geçişleri (Sayfa Yüklenirken animasyon)
window.onload = function() {
    const hero = document.querySelector('.hero');
    hero.style.transform = 'translateY(0)';
    hero.style.opacity = '1';
    hero.style.transition = 'all 1s ease-out';
};

// Menü Scroll Efekti (Navigasyon menüsü)
const navLinks = document.querySelectorAll("nav a");
navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute("href").substring(1);
        const targetElement = document.getElementById(targetId);
        window.scrollTo({
            top: targetElement.offsetTop - 60, // Menü yüksekliği kadar kaydır
            behavior: "smooth"
        });
    });
});

// Yazılımlar için Anlamlı Yanıtlar (Eğer belirli kelimeler bulunursa)
function customResponses(userInput) {
    userInput = userInput.toLowerCase();
    if (userInput.includes("okul") || userInput.includes("eğitim")) {
        return "Okulumuzda genel eğitim verilmektedir. Akademik başarı kadar kişisel gelişim de bizim için önemlidir!";
    }
    if (userInput.includes("yardım")) {
        return "Size nasıl yardımcı olabilirim? Yazılım, etkinlikler hakkında bilgi verebilirim!";
    }
    return "Bu konuda şu an bir bilgi bulunmamaktadır.";
}

// Sohbet Botu Anlamlı Yanıtlar
document.getElementById('chatInput').addEventListener('input', function(event) {
    const userInput = event.target.value.trim();
    if (userInput.length >= 3) {
        const dynamicResponse = customResponses(userInput);
        // Dinamik Yanıtları Sohbete Ekle
        document.getElementById('chatMessages').innerHTML += `<p><strong>Bot:</strong> ${dynamicResponse}</p>`;
    }
});

// Dinamik Buton Efektleri
const buttons = document.querySelectorAll('button');
buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'scale(1.1)';
        button.style.transition = 'transform 0.3s ease';
    });
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'scale(1)';
    });
});

// Dinamik Resim Değişimi (Galeriye Tıklama Etkisi)
const galleryImages = document.querySelectorAll('.gallery img');
galleryImages.forEach(image => {
    image.addEventListener('click', () => {
        image.style.transform = 'scale(1.05)';
        image.style.transition = 'transform 0.3s ease';
        setTimeout(() => {
            image.style.transform = 'scale(1)';
        }, 300);
    });
});