<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gelişmiş Giriş ve Kayıt Sistemi</title>
    <style>
        /* Genel stil */
        body {
            font-family: 'Courier New', monospace;
            background-color: black;
            color: #33ff33;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            overflow: hidden;
            position: relative;
        }

        .container {
            background-color: rgba(0, 0, 0, 0.8);
            padding: 30px;
            border-radius: 10px;
            width: 350px;
            box-shadow: 0 5px 15px rgba(0, 255, 0, 0.3);
            opacity: 0;
            transform: translateY(-50px);
            animation: fadeIn 1s forwards;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(-50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        h2 {
            text-align: center;
            font-size: 24px;
            margin-bottom: 20px;
            text-shadow: 0 0 10px #00ff00;
        }

        .input-field {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            border-radius: 5px;
            border: 1px solid #33ff33;
            font-size: 16px;
            background-color: #111;
            color: #33ff33;
            box-shadow: 0 0 5px rgba(0, 255, 0, 0.8);
        }

        button {
            width: 100%;
            padding: 12px;
            background-color: #00ff00;
            color: black;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            transition: transform 0.3s ease-in-out;
        }

        button:hover {
            background-color: #00b300;
            transform: scale(1.05);
        }

        .toggle-form {
            text-align: center;
            margin-top: 15px;
            font-size: 14px;
        }

        .error-message {
            color: red;
            font-size: 14px;
            animation: slideIn 0.5s ease-out;
        }

        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }

        .password-strength {
            font-size: 12px;
            color: #f39c12;
            margin-top: 5px;
        }

        .password-suggestions {
            font-size: 12px;
            color: #f39c12;
            margin-top: 10px;
        }

        .password-hint {
            color: #e74c3c;
            font-size: 14px;
        }

        .valid {
            color: green;
        }

        .invalid {
            color: red;
        }

        .neon-text {
            color: #00ff00;
            text-shadow: 0 0 5px #00ff00, 0 0 10px #00ff00, 0 0 20px #00ff00;
            animation: neon 1.5s infinite alternate;
        }

        @keyframes neon {
            from {
                text-shadow: 0 0 5px #00ff00, 0 0 10px #00ff00, 0 0 15px #00ff00;
            }
            to {
                text-shadow: 0 0 20px #00ff00, 0 0 30px #00ff00, 0 0 40px #00ff00;
            }
        }

        .background-lines {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: url('https://www.transparenttextures.com/patterns/asfalt.png') repeat;
            pointer-events: none;
            animation: moveBg 1s linear infinite;
        }

        @keyframes moveBg {
            from { background-position: 0 0; }
            to { background-position: 100px 100px; }
        }
    </style>
</head>
<body>

<div class="background-lines"></div>

<!-- Kayıt Formu -->
<div class="container" id="register-form">
    <h2><span class="neon-text">Kayıt Ol</span></h2>
    <form id="registerForm">
        <input type="text" id="registerName" class="input-field" placeholder="Adınız" required>
        <input type="email" id="registerEmail" class="input-field" placeholder="Email" required>
        <input type="password" id="registerPassword" class="input-field" placeholder="Şifre" required>
        <div id="passwordStrength" class="password-strength"></div>
        <div id="passwordSuggestions" class="password-suggestions">
            <p>Şifre en az 8 karakter uzunluğunda olmalı, büyük harf, küçük harf, rakam ve özel karakter içermelidir.</p>
        </div>
        <button type="submit">Kayıt Ol</button>
    </form>
    <div id="registerError" class="error-message"></div>
    <div class="toggle-form">
        <p>Hesabınız var mı? <a href="javascript:void(0);" onclick="toggleForms()">Giriş Yap</a></p>
    </div>
</div>

<!-- Giriş Formu -->
<div class="container" id="login-form" style="display: none;">
    <h2><span class="neon-text">Giriş Yap</span></h2>
    <form id="loginForm">
        <input type="email" id="loginEmail" class="input-field" placeholder="Email" required>
        <input type="password" id="loginPassword" class="input-field" placeholder="Şifre" required>
        <button type="submit">Giriş Yap</button>
    </form>
    <div id="loginError" class="error-message"></div>
    <div class="toggle-form">
        <p>Hesabınız yok mu? <a href="javascript:void(0);" onclick="toggleForms()">Kayıt Ol</a></p>
    </div>
</div>

<script>
    // Veritabanı olarak kullanılan JSON (DB.js)
    const usersDB = [];

    // Formlar arasında geçiş yapma
    function toggleForms() {
        var registerForm = document.getElementById("register-form");
        var loginForm = document.getElementById("login-form");
        
        if (registerForm.style.display === "none") {
            registerForm.style.display = "block";
            loginForm.style.display = "none";
        } else {
            registerForm.style.display = "none";
            loginForm.style.display = "block";
        }
    }

    // Şifreyi SHA-256 ile hash'lemek için fonksiyon
    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuffer)).map(byte => byte.toString(16).padStart(2, '0')).join('');
    }

    // Şifre güç seviyesini kontrol etme
    function checkPasswordStrength(password) {
        const strengthText = document.getElementById("passwordStrength");
        let strength = "";
        let score = 0;

        if (password.length >= 8) score++; // Uzunluk
        if (/[A-Z]/.test(password)) score++; // Büyük harf
        if (/[0-9]/.test(password)) score++; // Rakam
        if (/[^A-Za-z0-9]/.test(password)) score++; // Özel karakter

        if (score === 4) strength = "Çok güçlü";
        else if (score === 3) strength = "Güçlü";
        else if (score === 2) strength = "Ortalama";
        else strength = "Zayıf";

        strengthText.textContent = "Şifre gücü: " + strength;
        return score;
    }

    // Kullanıcıyı kaydetme
    function saveUserToStorage(user) {
        usersDB.push(user);
        console.log("Kullanıcı başarıyla kaydedildi.");
    }

    // Kullanıcıyı doğrulama
    function validateUser(email, password) {
        return usersDB.find(user => user.email === email && user.password === password);
    }

    // Kayıt işlemi
    document.getElementById("registerForm").addEventListener("submit", async function(event) {
        event.preventDefault();
        
        var name = document.getElementById("registerName").value;
        var email = document.getElementById("registerEmail").value;
        var password = document.getElementById("registerPassword").value;

        // Email ve şifre validasyonu
        if (!validateEmail(email)) {
            document.getElementById("registerError").textContent = "Geçersiz email formatı!";
            return;
        }

        const passwordStrength = checkPasswordStrength(password);
        if (passwordStrength < 3) {
            document.getElementById("registerError").textContent = "Şifreniz çok zayıf. Lütfen güçlü bir şifre kullanın.";
            return;
        }

        var hashedPassword = await hashPassword(password);

        // Kullanıcıyı kaydet
        saveUserToStorage({ name, email, password: hashedPassword });
        alert("Kayıt başarılı! Artık giriş yapabilirsiniz.");
        toggleForms();
    });

    // Giriş işlemi
    document.getElementById("loginForm").addEventListener("submit", function(event) {
        event.preventDefault();
        
        var email = document.getElementById("loginEmail").value;
        var password = document.getElementById("loginPassword").value;

        hashPassword(password).then(function(hashedPassword) {
            let user = validateUser(email, hashedPassword);

            if (user) {
                alert("Giriş başarılı! Hoş geldiniz, " + user.name);
            } else {
                document.getElementById("loginError").textContent = "Geçersiz giriş! Lütfen email ve şifrenizi kontrol edin.";
            }
        });
    });
</script>

</body>
</html>