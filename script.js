// Saat Gösterimi
function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    document.getElementById('clock').textContent = `Türkiye Saati: ${hours}:${minutes}:${seconds}`;
}
setInterval(updateClock, 1000);

// Sohbet Popup
function toggleChatbot() {
    var chatPopup = document.getElementById('chatPopup');
    chatPopup.style.display = chatPopup.style.display === 'block' ? 'none' : 'block';
}

// Sohbet Botu Yanıtları
const responses = {
    "Okul hakkında bilgi istiyorum": "Reha Gündüz Aksoy Anadolu Lisesi, Gaziantep'te yer alıyor ve eğitimde teknolojiye odaklanmış bir okul olarak tanınmaktadır.",
    "Okulun amacı nedir": "Amacımız, öğrencilere yazılım ve teknoloji becerileri kazandırmaktır.",
    "Ne tür etkinlikler yapıyorsunuz": "Okulumuzda yazılım, teknoloji ve bilim etkinlikleri düzenlenmektedir.",
    "Okulun başarıları nelerdir": "Okulumuz, yazılım yarışmalarında ödüller kazanmış ve öğrencilerini başarılı bir şekilde mezun etmiştir."
};

document.getElementById('chatInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        var userInput = event.target.value.trim();
        if (userInput) {
            var messagesDiv = document.getElementById('chatMessages');
            var userName = "Kullanıcı";
            messagesDiv.innerHTML += `<p><b>${userName}:</b> ${userInput}</p>`;
            if (responses[userInput]) {
                messagesDiv.innerHTML += `<p><b>Bot:</b> ${responses[userInput]}</p>`;
            } else {
                messagesDiv.innerHTML += `<p><b>Bot:</b> Üzgünüm, bunu anlayamadım. Lütfen başka bir soru sorun.</p>`;
            }
            event.target.value = '';
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    }
});