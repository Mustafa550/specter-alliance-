// routes.js
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const models = require('./models');
const nodemailer = require('nodemailer');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_secret';

// nodemailer transporter (if env vars present)
let transporter = null;
if (process.env.SMTP_HOST && process.env.SENDER_EMAIL && process.env.SENDER_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: { user: process.env.SENDER_EMAIL, pass: process.env.SENDER_PASS }
  });
} else {
  console.log('Mail transporter not configured (SMTP_HOST or SENDER_* missing). Password reset tokens will be logged to console.');
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Token yok' });
  const parts = header.split(' ');
  if (parts.length !== 2) return res.status(401).json({ error: 'Token formatı hatalı' });
  const token = parts[1];
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token geçersiz' });
  }
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (!req.user.is_admin) return res.status(403).json({ error: 'Admin yetkisi gerekli' });
    next();
  });
}

// --- Auth ---
router.post('/auth/register', async (req, res) => {
  const { email, username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username ve password gerekli' });
  try {
    const existing = await models.findUserByEmailOrUsername(username);
    if (existing) return res.status(400).json({ error: 'Kullanıcı adı veya e-posta zaten kayıtlı' });
    const user = await models.createUser({ email, username, password });
    const token = jwt.sign({ id: user.id, username: user.username, is_admin: user.is_admin }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, username: user.username } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Kayıt hatası' });
  }
});

router.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Eksik alan' });
  try {
    const user = await models.findUserByEmailOrUsername(username);
    if (!user) return res.status(400).json({ error: 'Kullanıcı bulunamadı' });
    const bcrypt = require('bcrypt');
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: 'Şifre yanlış' });
    const token = jwt.sign({ id: user.id, username: user.username, is_admin: user.is_admin }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, is_admin: user.is_admin } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Giriş hatası' });
  }
});

// Request password reset -> sends email (or logs token)
router.post('/auth/request-reset', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'E-posta gerekli' });
  try {
    const user = await models.findUserByEmailOrUsername(email);
    if (!user) return res.status(400).json({ error: 'E-posta kayıtlı değil' });
    const { token, expires } = await models.setResetTokenForUser(user.id);
    const resetLink = `${req.protocol}://${req.get('host')}/public/index.html#reset/${token}`;
    const text = `Merhaba ${user.username},\n\nŞifre sıfırlama isteği alındı. Bağlantıya tıklayarak şifrenizi değiştirebilirsiniz (1 saat geçerli):\n\n${resetLink}\n\nEğer istemediyseniz bu e-postayı ignore edebilirsiniz.`;
    if (transporter) {
      await transporter.sendMail({ from: process.env.SENDER_EMAIL, to: user.email, subject: 'Şifre Sıfırlama', text });
      return res.json({ ok: true, msg: 'Sıfırlama linki e-posta ile gönderildi.' });
    } else {
      console.log('Password reset token (dev mode):', token);
      console.log('Reset link:', resetLink);
      return res.json({ ok: true, msg: 'Geliştirme modu: token konsola yazıldı.' });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Hata' });
  }
});

// Reset using token
router.post('/auth/reset/:token', async (req, res) => {
  const token = req.params.token;
  const { password } = req.body;
  if (!password || password.length < 6) return res.status(400).json({ error: 'Yeni şifre 6+ karakter olmalı' });
  try {
    const userId = await models.verifyResetToken(token);
    if (!userId) return res.status(400).json({ error: 'Token geçersiz veya süresi dolmuş' });
    await models.updatePasswordForUser(userId, password);
    res.json({ ok: true, msg: 'Şifre güncellendi' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Hata' });
  }
});

// --- Products & categories ---
router.get('/categories', async (req, res) => {
  try {
    const cats = await models.listCategories();
    res.json(cats);
  } catch (e) { res.status(500).json({ error: 'DB hata' }); }
});

router.post('/admin/categories', requireAdmin, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'İsim gerekli' });
  try {
    const id = await models.createCategory(name);
    res.json({ id });
  } catch (e) { res.status(500).json({ error: 'Kategori ekleme hatası' }); }
});

router.get('/products', async (req, res) => {
  const { category, q } = req.query;
  try {
    const rows = await models.listProducts({ category, q });
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'DB hata' }); }
});

router.get('/products/:id', async (req, res) => {
  try {
    const p = await models.getProduct(req.params.id);
    if (!p) return res.status(404).json({ error: 'Ürün bulunamadı' });
    res.json(p);
  } catch (e) { res.status(500).json({ error: 'DB hata' }); }
});

// Comments
router.get('/comments/product/:id', async (req, res) => {
  try { const rows = await models.listCommentsForProduct(req.params.id); res.json(rows); } catch (e) { res.status(500).json({ error: 'DB hata' }); }
});

router.post('/comments/product/:id', requireAuth, async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'Yorum boş' });
  try {
    const id = await models.addComment(req.params.id, req.user.id, text);
    res.json({ id });
  } catch (e) { res.status(500).json({ error: 'DB hata' }); }
});

// Orders
router.post('/orders', requireAuth, async (req, res) => {
  const { items, total } = req.body;
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'Sepet boş' });
  try {
    const orderId = await models.createOrder(req.user.id, items, total);
    res.json({ orderId });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Sipariş oluşturulamadı' }); }
});

router.get('/orders', requireAuth, async (req, res) => {
  try { const rows = await models.listOrdersForUser(req.user.id); res.json(rows); } catch (e) { res.status(500).json({ error: 'DB hata' }); }
});

router.get('/admin/orders', requireAdmin, async (req, res) => {
  try { const rows = await models.adminListOrders(); res.json(rows); } catch (e) { res.status(500).json({ error: 'DB hata' }); }
});

module.exports = router;