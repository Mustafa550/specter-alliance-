#!/data/data/com.termux/files/usr/bin/python3
# -*- coding: utf-8 -*-
import os
import time
import random
import json
import hashlib
from flask import Flask, request, render_template_string, session, redirect, url_for, flash
import requests
from colorama import init, Fore, Style

# Colorama başlatma (terminal log için)
init()

# Flask uygulaması
app = Flask(__name__)
app.secret_key = 'necroz31_hacker_secret_2025'  # Oturum için güvenlik anahtarı

# Kullanıcı veritabanı (yerel JSON simülasyonu)
users_file = '/sdcard/necroz31_users.json'
if not os.path.exists(users_file):
    with open(users_file, 'w', encoding='utf-8') as f:
        json.dump({}, f)

# API ayarları
CHECKER_API_URL = 'https://api.chkr.cc/'

# Loglama fonksiyonu
def yaz_log(mesaj):
    zaman_damgasi = time.strftime("%Y-%m-%d %H:%M:%S")
    log_mesaji = f"[{zaman_damgasi}] NECROZ31 CHECKER {mesaj}"
    print(Fore.GREEN + log_mesaji + Style.RESET_ALL)
    log_dizini = "/sdcard/.necroz31_checker_logs"
    os.makedirs(log_dizini, exist_ok=True)
    with open(f"{log_dizini}/checker_log_{zaman_damgasi.split()[0]}.txt", "a", encoding="utf-8") as f:
        f.write(f"{log_mesaji}\n")

# Kullanıcı kayıt fonksiyonu
def kayit_ol(username, password):
    with open(users_file, 'r', encoding='utf-8') as f:
        users = json.load(f)
    if username in users:
        return False
    users[username] = generate_password_hash(password)
    with open(users_file, 'w', encoding='utf-8') as f:
        json.dump(users, f)
    yaz_log(f"Kullanıcı kaydedildi: {username}")
    return True

# Kullanıcı giriş fonksiyonu
def giris_yap(username, password):
    with open(users_file, 'r', encoding='utf-8') as f:
        users = json.load(f)
    if username in users and check_password_hash(users[username], password):
        session['username'] = username
        yaz_log(f"Kullanıcı giriş yaptı: {username}")
        return True
    return False

# Checker API çağrısı
def checker_api_cagiri(kart_numarasi, son_kullanma, cvv):
    headers = {'Content-Type': 'application/json'}
    data = {
        "card_number": kart_numarasi,
        "expiry": son_kullanma,
        "cvv": cvv
    }
    try:
        response = requests.post(CHECKER_API_URL, json=data, headers=headers, timeout=10)
        if response.status_code == 200:
            result = response.json()
            yaz_log(f"Checker sonucu: {result}")
            return result
        else:
            yaz_log(f"API hatası: {response.status_code}")
            return {"error": "API Hatası", "status_code": response.status_code}
    except Exception as e:
        yaz_log(f"API çağrı hatası: {e}")
        return {"error": str(e)}

# Hacker tarzı banner (HTML içinde kullanılacak)
HACKER_BANNER = """
<div style="background: #000; color: #0f0; font-family: 'Courier New', monospace; padding: 10px; text-align: center;">
    <h1>╔════════════════════════════════════╗</h1>
    <h1>║ NECROZ31 - HACKER CHECKER SYSTEM  ║</h1>
    <h1>╚════════════════════════════════════╝</h1>
    <p style="color: #ff0;">Beyaz Şapkalı Hacker Grubu - 2025</p>
</div>
"""

# Ana sayfa (giriş/kayıt kontrolü)
@app.route('/', methods=['GET', 'POST'])
def index():
    if 'username' in session:
        return redirect(url_for('dashboard'))
    if request.method == 'POST':
        action = request.form.get('action')
        if action == 'register':
            username = request.form['username']
            password = request.form['password']
            if kayit_ol(username, password):
                flash('Kayıt başarılı! Giriş yapabilirsiniz.', 'success')
            else:
                flash('Kullanıcı adı zaten mevcut!', 'danger')
        elif action == 'login':
            username = request.form['username']
            password = request.form['password']
            if giris_yap(username, password):
                return redirect(url_for('dashboard'))
            else:
                flash('Geçersiz kullanıcı adı veya şifre!', 'danger')
    return render_template_string("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>NECROZ31 Checker</title>
        <style>
            body { background: #1a1a1a; color: #0f0; font-family: 'Courier New', monospace; margin: 0; padding: 20px; }
            .container { max-width: 500px; margin: 50px auto; background: #222; padding: 20px; border: 2px solid #0f0; }
            .form-group { margin-bottom: 15px; }
            label { display: block; margin-bottom: 5px; }
            input { width: 100%; padding: 8px; background: #333; border: 1px solid #0f0; color: #0f0; }
            button { padding: 10px 20px; background: #0f0; color: #000; border: none; cursor: pointer; }
            button:hover { background: #0c0; }
            .flash { padding: 10px; margin-bottom: 10px; }
            .success { background: #0f0; color: #000; }
            .danger { background: #f00; color: #fff; }
        </style>
    </head>
    <body>
        {{ banner|safe }}
        <div class="container">
            {% with messages = get_flashed_messages(with_categories=true) %}
                {% if messages %}
                    {% for category, message in messages %}
                        <div class="flash {{ category }}">{{ message }}</div>
                    {% endfor %}
                {% endif %}
            {% endwith %}
            <h2>Giriş Yap</h2>
            <form method="POST">
                <input type="hidden" name="action" value="login">
                <div class="form-group">
                    <label>Kullanıcı Adı:</label>
                    <input type="text" name="username" required>
                </div>
                <div class="form-group">
                    <label>Şifre:</label>
                    <input type="password" name="password" required>
                </div>
                <button type="submit">Giriş Yap</button>
            </form>
            <h2>Kayıt Ol</h2>
            <form method="POST">
                <input type="hidden" name="action" value="register">
                <div class="form-group">
                    <label>Kullanıcı Adı:</label>
                    <input type="text" name="username" required>
                </div>
                <div class="form-group">
                    <label>Şifre:</label>
                    <input type="password" name="password" required>
                </div>
                <button type="submit">Kayıt Ol</button>
            </form>
        </div>
    </body>
    </html>
    """, banner=HACKER_BANNER)

# Dashboard (kontrol paneli)
@app.route('/dashboard', methods=['GET', 'POST'])
def dashboard():
    if 'username' not in session:
        return redirect(url_for('index'))
    if request.method == 'POST':
        kart_numarasi = request.form['card_number']
        son_kullanma = request.form['expiry']
        cvv = request.form['cvv']
        result = checker_api_cagiri(kart_numarasi, son_kullanma, cvv)
        flash(f"Sonuç: {json.dumps(result)}", 'success' if 'error' not in result else 'danger')
    return render_template_string("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>NECROZ31 Checker - Dashboard</title>
        <style>
            body { background: #1a1a1a; color: #0f0; font-family: 'Courier New', monospace; margin: 0; padding: 20px; }
            .container { max-width: 800px; margin: 50px auto; background: #222; padding: 20px; border: 2px solid #0f0; }
            .form-group { margin-bottom: 15px; }
            label { display: block; margin-bottom: 5px; }
            input { width: 100%; padding: 8px; background: #333; border: 1px solid #0f0; color: #0f0; }
            button { padding: 10px 20px; background: #0f0; color: #000; border: none; cursor: pointer; }
            button:hover { background: #0c0; }
            .flash { padding: 10px; margin-bottom: 10px; }
            .success { background: #0f0; color: #000; }
            .danger { background: #f00; color: #fff; }
            .menu { margin-top: 20px; }
            .menu a { color: #0f0; text-decoration: none; margin-right: 15px; }
            .menu a:hover { color: #ff0; }
        </style>
    </head>
    <body>
        {{ banner|safe }}
        <div class="container">
            {% with messages = get_flashed_messages(with_categories=true) %}
                {% if messages %}
                    {% for category, message in messages %}
                        <div class="flash {{ category }}">{{ message }}</div>
                    {% endfor %}
                {% endif %}
            {% endwith %}
            <h2>Merhaba, {{ session['username'] }}!</h2>
            <form method="POST">
                <div class="form-group">
                    <label>Kart Numarası:</label>
                    <input type="text" name="card_number" required>
                </div>
                <div class="form-group">
                    <label>Son Kullanma Tarihi (MM/YY):</label>
                    <input type="text" name="expiry" required>
                </div>
                <div class="form-group">
                    <label>CVV:</label>
                    <input type="text" name="cvv" required>
                </div>
                <button type="submit">Kontrol Et</button>
            </form>
            <div class="menu">
                <a href="{{ url_for('settings') }}">Ayarlar</a>
                <a href="{{ url_for('logs') }}">Loglar</a>
            </div>
        </div>
    </body>
    </html>
    """, banner=HACKER_BANNER)

# Ayarlar menüsü
@app.route('/settings', methods=['GET', 'POST'])
def settings():
    if 'username' not in session:
        return redirect(url_for('index'))
    if request.method == 'POST':
        # Ayarları burada işleyebilirsin (örneğin tema değiştirme)
        flash('Ayarlar güncellendi!', 'success')
    return render_template_string("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>NECROZ31 Checker - Ayarlar</title>
        <style>
            body { background: #1a1a1a; color: #0f0; font-family: 'Courier New', monospace; margin: 0; padding: 20px; }
            .container { max-width: 500px; margin: 50px auto; background: #222; padding: 20px; border: 2px solid #0f0; }
            .form-group { margin-bottom: 15px; }
            label { display: block; margin-bottom: 5px; }
            input { width: 100%; padding: 8px; background: #333; border: 1px solid #0f0; color: #0f0; }
            button { padding: 10px 20px; background: #0f0; color: #000; border: none; cursor: pointer; }
            button:hover { background: #0c0; }
            .flash { padding: 10px; margin-bottom: 10px; }
            .success { background: #0f0; color: #000; }
            .danger { background: #f00; color: #fff; }
            .menu { margin-top: 20px; }
            .menu a { color: #0f0; text-decoration: none; margin-right: 15px; }
            .menu a:hover { color: #ff0; }
        </style>
    </head>
    <body>
        {{ banner|safe }}
        <div class="container">
            {% with messages = get_flashed_messages(with_categories=true) %}
                {% if messages %}
                    {% for category, message in messages %}
                        <div class="flash {{ category }}">{{ message }}</div>
                    {% endfor %}
                {% endif %}
            {% endwith %}
            <h2>Ayarlar</h2>
            <form method="POST">
                <div class="form-group">
                    <label>Tema:</label>
                    <input type="text" name="theme" value="Hacker" readonly>
                </div>
                <button type="submit">Kaydet</button>
            </form>
            <div class="menu">
                <a href="{{ url_for('dashboard') }}">Geri Dön</a>
            </div>
        </div>
    </body>
    </html>
    """, banner=HACKER_BANNER)

# Loglar menüsü
@app.route('/logs')
def logs():
    if 'username' not in session:
        return redirect(url_for('index'))
    log_dizini = "/sdcard/.necroz31_checker_logs"
    if os.path.exists(log_dizini):
        log_dosyasi = max([f for f in os.listdir(log_dizini) if f.endswith(".txt")], key=lambda x: os.path.getctime(os.path.join(log_dizini, x)))
        with open(os.path.join(log_dizini, log_dosyasi), "r", encoding="utf-8") as f:
            log_icerik = f.read()
    else:
        log_icerik = "Log bulunamadı."
    return render_template_string("""
    <!DOCTYPE html>
    <html>
    <head>
        <title>NECROZ31 Checker - Loglar</title>
        <style>
            body { background: #1a1a1a; color: #0f0; font-family: 'Courier New', monospace; margin: 0; padding: 20px; }
            .container { max-width: 800px; margin: 50px auto; background: #222; padding: 20px; border: 2px solid #0f0; }
            .log-content { white-space: pre-wrap; }
            .menu { margin-top: 20px; }
            .menu a { color: #0f0; text-decoration: none; margin-right: 15px; }
            .menu a:hover { color: #ff0; }
        </style>
    </head>
    <body>
        {{ banner|safe }}
        <div class="container">
            <h2>Log Kayıtları</h2>
            <div class="log-content">{{ log_content }}</div>
            <div class="menu">
                <a href="{{ url_for('dashboard') }}">Geri Dön</a>
            </div>
        </div>
    </body>
    </html>
    """, banner=HACKER_BANNER, log_content=log_icerik)

# Oturumu kalıcı hale getir (çıkış yok)
@app.route('/logout')
def logout():
    flash('Çıkış yapılmadı, oturum kalıcıdır!', 'info')
    return redirect(url_for('dashboard'))

if __name__ == '__main__':
    # Terminalde başlatma mesajı
    print(Fore.RED + "==========================================", end="", flush=True)
    print(Fore.GREEN + "=== NECROZ31 CHECKER SİSTEMİ BAŞLATILIYOR ===", end="", flush=True)
    print(Fore.RED + "==========================================" + Style.RESET_ALL, end="", flush=True)
    yaz_log("Sistem başlatıldı")
    # Flask uygulamasını çalıştır
    app.run(host='0.0.0.0', port=5000, debug=False)