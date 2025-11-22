from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import threading
import time
from datetime import datetime, timedelta
import requests
import json
import os

app = Flask(__name__)
CORS(app)

# Ücretsiz veritabanı (SQLite)
DATABASE_URL = "bot_manager.db"

def init_db():
    conn = sqlite3.connect(DATABASE_URL)
    c = conn.cursor()
    
    c.execute('''CREATE TABLE IF NOT EXISTS bots
                 (id INTEGER PRIMARY KEY, 
                  user_id TEXT,
                  bot_token TEXT, 
                  bot_name TEXT, 
                  status TEXT,
                  created_at TIMESTAMP)''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS api_keys
                 (id INTEGER PRIMARY KEY,
                  key_value TEXT UNIQUE,
                  user_id TEXT,
                  expires_at TIMESTAMP,
                  is_active BOOLEAN)''')
    
    # Admin anahtarını ekle
    c.execute("INSERT OR IGNORE INTO api_keys (key_value, user_id, expires_at, is_active) VALUES (?, ?, ?, ?)",
              ('DJF27DJF', 'admin', '2099-12-31', True))
    
    conn.commit()
    conn.close()

# Telegram Bot Başlatma
def start_telegram_bot(bot_token, bot_name):
    try:
        # Telegram API'ye bağlan ve botu başlat
        url = f"https://api.telegram.org/bot{bot_token}/getMe"
        response = requests.get(url)
        
        if response.status_code == 200:
            # Bot geçerli, webhook kur (gerçek çalışma için)
            webhook_url = f"https://api.telegram.org/bot{bot_token}/setWebhook?url=https://your-webhook-url.com"
            requests.get(webhook_url)
            
            return True
        else:
            return False
            
    except Exception as e:
        print(f"Bot başlatma hatası: {e}")
        return False

# API Routes
@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.json
    api_key = data.get('api_key')
    
    conn = sqlite3.connect(DATABASE_URL)
    c = conn.cursor()
    
    c.execute("SELECT * FROM api_keys WHERE key_value = ? AND is_active = 1", (api_key,))
    key_data = c.fetchone()
    
    if key_data:
        user_id = key_data[2]
        conn.close()
        return jsonify({
            'success': True,
            'message': 'Giriş başarılı!',
            'user_id': user_id,
            'is_admin': user_id == 'admin'
        })
    else:
        conn.close()
        return jsonify({'success': False, 'message': 'Geçersiz API anahtarı!'})

@app.route('/api/add_bot', methods=['POST'])
def api_add_bot():
    data = request.json
    bot_token = data.get('bot_token')
    bot_name = data.get('bot_name')
    user_id = data.get('user_id')
    
    if not bot_token or not bot_name:
        return jsonify({'success': False, 'message': 'Token ve bot adı gerekli!'})
    
    # Gerçek Telegram botunu başlat
    bot_started = start_telegram_bot(bot_token, bot_name)
    
    if bot_started:
        conn = sqlite3.connect(DATABASE_URL)
        c = conn.cursor()
        
        c.execute("INSERT INTO bots (user_id, bot_token, bot_name, status, created_at) VALUES (?, ?, ?, ?, ?)",
                 (user_id, bot_token, bot_name, 'active', datetime.now()))
        conn.commit()
        
        bot_id = c.lastrowid
        conn.close()
        
        return jsonify({
            'success': True, 
            'message': 'Bot başarıyla eklendi ve çalıştırıldı!',
            'bot_id': bot_id
        })
    else:
        return jsonify({'success': False, 'message': 'Bot başlatılamadı! Tokeni kontrol edin.'})

@app.route('/api/get_bots', methods=['GET'])
def api_get_bots():
    user_id = request.args.get('user_id')
    
    conn = sqlite3.connect(DATABASE_URL)
    c = conn.cursor()
    
    c.execute("SELECT * FROM bots WHERE user_id = ?", (user_id,))
    bots = c.fetchall()
    
    bot_list = []
    for bot in bots:
        bot_list.append({
            'id': bot[0],
            'user_id': bot[1],
            'token': bot[2],
            'name': bot[3],
            'status': bot[4],
            'created_at': bot[5]
        })
    
    conn.close()
    return jsonify({'success': True, 'bots': bot_list})

@app.route('/api/stop_bot', methods=['POST'])
def api_stop_bot():
    data = request.json
    bot_id = data.get('bot_id')
    user_id = data.get('user_id')
    
    conn = sqlite3.connect(DATABASE_URL)
    c = conn.cursor()
    
    c.execute("UPDATE bots SET status = 'inactive' WHERE id = ? AND user_id = ?", 
             (bot_id, user_id))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'message': 'Bot durduruldu!'})

@app.route('/api/start_bot', methods=['POST'])
def api_start_bot():
    data = request.json
    bot_id = data.get('bot_id')
    user_id = data.get('user_id')
    
    conn = sqlite3.connect(DATABASE_URL)
    c = conn.cursor()
    
    c.execute("SELECT bot_token, bot_name FROM bots WHERE id = ? AND user_id = ?", (bot_id, user_id))
    bot_data = c.fetchone()
    
    if bot_data:
        bot_token, bot_name = bot_data
        bot_started = start_telegram_bot(bot_token, bot_name)
        
        if bot_started:
            c.execute("UPDATE bots SET status = 'active' WHERE id = ?", (bot_id,))
            conn.commit()
            conn.close()
            return jsonify({'success': True, 'message': 'Bot başlatıldı!'})
    
    conn.close()
    return jsonify({'success': False, 'message': 'Bot başlatılamadı!'})

@app.route('/api/delete_bot', methods=['POST'])
def api_delete_bot():
    data = request.json
    bot_id = data.get('bot_id')
    user_id = data.get('user_id')
    
    conn = sqlite3.connect(DATABASE_URL)
    c = conn.cursor()
    
    c.execute("DELETE FROM bots WHERE id = ? AND user_id = ?", (bot_id, user_id))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'message': 'Bot silindi!'})

@app.route('/api/generate_key', methods=['POST'])
def api_generate_key():
    data = request.json
    key_name = data.get('key_name')
    days_valid = data.get('days', 30)
    admin_id = data.get('admin_id')
    
    if admin_id != 'admin':
        return jsonify({'success': False, 'message': 'Yetkisiz işlem!'})
    
    new_key = f"KEY_{secrets.token_hex(8).upper()}"
    expires_at = datetime.now() + timedelta(days=days_valid)
    
    conn = sqlite3.connect(DATABASE_URL)
    c = conn.cursor()
    
    c.execute("INSERT INTO api_keys (key_value, user_id, expires_at, is_active) VALUES (?, ?, ?, ?)",
             (new_key, 'user', expires_at, True))
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'key': new_key, 'message': 'Anahtar oluşturuldu!'})

if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)