// db.js
// SQLite init, migrations, seed, and promise wrappers

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

const DB_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DB_DIR, 'app.db');

function ensureDirs() {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
  const UP = path.join(__dirname, 'uploads');
  if (!fs.existsSync(UP)) fs.mkdirSync(UP, { recursive: true });
}

function open() {
  ensureDirs();
  return new sqlite3.Database(DB_FILE);
}

function execAsync(db, sql) {
  return new Promise((res, rej) => {
    db.exec(sql, (err) => err ? rej(err) : res());
  });
}

async function migrate(db) {
  const sql = `
  PRAGMA foreign_keys = ON;
  BEGIN TRANSACTION;
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    username TEXT UNIQUE,
    password TEXT,
    is_admin INTEGER DEFAULT 0,
    reset_token TEXT,
    reset_expires INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    stock INTEGER DEFAULT 0,
    image TEXT,
    category_id INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
  );
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total REAL NOT NULL,
    items TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  COMMIT;
  `;
  await execAsync(db, sql);
}

async function seed(db) {
  const get = (sql, params=[]) => new Promise((res, rej) => db.get(sql, params, (e, r) => e ? rej(e) : res(r)));
  const run = (sql, params=[]) => new Promise((res, rej) => db.run(sql, params, function(err){ err ? rej(err) : res(this); }));

  const { cnt } = await get('SELECT COUNT(*) as cnt FROM categories');
  if (cnt > 0) {
    console.log('Seed: zaten veri var, atlanıyor.');
    return;
  }

  const cats = ['Elektronik','Oyun','Moda','Ev & Yaşam','Spor','Kişisel Bakım'];
  for (const c of cats) {
    await run('INSERT INTO categories (name) VALUES (?)', [c]);
  }

  const products = [
    {name:'Bluetooth Kulaklık', category:'Elektronik', price:350, stock:5, image:'/uploads/sample_headset.png', description:'Uzun pil ömrü, konforlu.'},
    {name:'Valorant Hesabı (Gold)', category:'Oyun', price:160, stock:20, image:'/uploads/sample_valorant.png', description:'Gold rank, teslimat anında.'},
    {name:'Kot Pantolon', category:'Moda', price:200, stock:30, image:'/uploads/sample_jeans.png', description:'Rahat kesim, %100 pamuk.'},
    {name:'Kahve Makinesi', category:'Ev & Yaşam', price:650, stock:7, image:'/uploads/sample_coffee.png', description:'1.5L, otomatik kapanma.'},
    {name:'Akıllı Saat', category:'Elektronik', price:499, stock:12, image:'/uploads/sample_watch.png', description:'Kalp ritmi ve bildirim.'},
    {name:'Spor Ayakkabı', category:'Moda', price:420, stock:8, image:'/uploads/sample_shoes.png', description:'Nefes alabilir.'},
    {name:'Minecraft Hesap', category:'Oyun', price:150, stock:15, image:'/uploads/sample_minecraft.png', description:'Premium hesap, e-posta doğrulandı.'}
  ];

  for (const p of products) {
    const row = await get('SELECT id FROM categories WHERE name = ?', [p.category]);
    await run('INSERT INTO products (name,description,price,stock,image,category_id) VALUES (?,?,?,?,?,?)', [p.name, p.description, p.price, p.stock, p.image, row ? row.id : null]);
  }

  const adminPass = await bcrypt.hash('admin1234', 10);
  await run('INSERT INTO users (email,username,password,is_admin) VALUES (?,?,?,1)', ['admin@example.com','admin',adminPass]);
  console.log('Seed tamamlandı: admin/admin1234');
}

let DB = null;

async function init({ migrateFlag=true, seedIfEmpty=true } = {}) {
  DB = open();
  if (migrateFlag) {
    await migrate(DB);
  }
  if (seedIfEmpty) {
    await seed(DB);
  }
  return DB;
}

function getDB() { return DB; }

// Simple wrappers
function all(sql, params=[]) { return new Promise((res, rej) => DB.all(sql, params, (e, r) => e ? rej(e) : res(r))); }
function get(sql, params=[]) { return new Promise((res, rej) => DB.get(sql, params, (e, r) => e ? rej(e) : res(r))); }
function runStmt(sql, params=[]) { return new Promise((res, rej) => DB.run(sql, params, function(err){ err ? rej(err) : res(this); })); }

if (require.main === module) {
  (async () => {
    const args = process.argv.slice(2);
    const migrateFlag = args.includes('--migrate') || args.includes('migrate');
    const seedFlag = args.includes('--seed') || args.includes('seed');
    const db = open();
    if (migrateFlag) {
      console.log('Migrasyon çalıştırılıyor...');
      await migrate(db);
      console.log('Migrasyon tamamlandı.');
    }
    if (seedFlag) {
      console.log('Seed çalıştırılıyor...');
      await seed(db);
      console.log('Seed tamamlandı.');
    }
    db.close();
  })().catch(err => { console.error(err); process.exit(1); });
}

module.exports = { init, getDB, all, get, runStmt };