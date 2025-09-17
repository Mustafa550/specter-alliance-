// models.js
// High-level DB operations using db.js wrapper
const dbModule = require('./db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

async function createUser({ email, username, password, is_admin=0 }) {
  const hash = await bcrypt.hash(password, 10);
  const res = await dbModule.runStmt('INSERT INTO users (email,username,password,is_admin) VALUES (?,?,?,?)', [email||null, username, hash, is_admin]);
  return { id: res.lastID, email, username, is_admin };
}

async function findUserByEmailOrUsername(identifier) {
  return await dbModule.get('SELECT * FROM users WHERE username = ? OR email = ?', [identifier, identifier]);
}

async function getUserById(id) {
  return await dbModule.get('SELECT id,email,username,is_admin,created_at FROM users WHERE id = ?', [id]);
}

async function setResetTokenForUser(userId) {
  const token = uuidv4();
  const expires = Date.now() + (60*60*1000); // 1 hour
  await dbModule.runStmt('UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?', [token, expires, userId]);
  return { token, expires };
}

async function verifyResetToken(token) {
  const row = await dbModule.get('SELECT id, reset_expires FROM users WHERE reset_token = ?', [token]);
  if (!row) return null;
  if (row.reset_expires < Date.now()) return null;
  return row.id;
}

async function updatePasswordForUser(userId, newPassword) {
  const hash = await bcrypt.hash(newPassword, 10);
  await dbModule.runStmt('UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?', [hash, userId]);
  return true;
}

async function listCategories() {
  return await dbModule.all('SELECT * FROM categories ORDER BY name');
}

async function createCategory(name) {
  const res = await dbModule.runStmt('INSERT INTO categories (name) VALUES (?)', [name]);
  return res.lastID;
}

async function listProducts({ category, q } = {}) {
  let sql = 'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id';
  const params = [];
  const where = [];
  if (category) { where.push('c.name = ?'); params.push(category); }
  if (q) { where.push('(p.name LIKE ? OR p.description LIKE ?)'); params.push(`%${q}%`, `%${q}%`); }
  if (where.length) sql += ' WHERE ' + where.join(' AND ');
  sql += ' ORDER BY p.created_at DESC';
  return await dbModule.all(sql, params);
}

async function getProduct(id) {
  return await dbModule.get('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?', [id]);
}

async function addComment(productId, userId, text) {
  const res = await dbModule.runStmt('INSERT INTO comments (product_id,user_id,text) VALUES (?,?,?)', [productId, userId, text]);
  return res.lastID;
}

async function listCommentsForProduct(productId) {
  return await dbModule.all('SELECT c.*, u.username FROM comments c JOIN users u ON c.user_id = u.id WHERE c.product_id = ? ORDER BY c.created_at DESC', [productId]);
}

async function createOrder(userId, items, total) {
  const itemsStr = JSON.stringify(items);
  const res = await dbModule.runStmt('INSERT INTO orders (user_id,total,items) VALUES (?,?,?)', [userId, total, itemsStr]);
  const orderId = res.lastID;
  // decrement stock for each item (best-effort)
  for (const it of items) {
    await dbModule.runStmt('UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?', [it.adet, it.id, it.adet]).catch(()=>{});
  }
  return orderId;
}

async function listOrdersForUser(userId) {
  const rows = await dbModule.all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
  return rows.map(r => ({ ...r, items: JSON.parse(r.items) }));
}

async function adminListOrders() {
  const rows = await dbModule.all('SELECT o.*, u.username, u.email FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC', []);
  return rows.map(r => ({ ...r, items: JSON.parse(r.items) }));
}

module.exports = {
  createUser,
  findUserByEmailOrUsername,
  getUserById,
  setResetTokenForUser,
  verifyResetToken,
  updatePasswordForUser,
  listCategories,
  createCategory,
  listProducts,
  getProduct,
  addComment,
  listCommentsForProduct,
  createOrder,
  listOrdersForUser,
  adminListOrders
};