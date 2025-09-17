// server.js
require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '8mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// static public
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

// ensure DB ready & mount routes
(async () => {
  try {
    await db.init({ migrateFlag: true, seedIfEmpty: true });
    // middleware to attach db to req (so models/routes can use db via db.getDB() or models)
    app.use((req, res, next) => { req.DB = db.getDB(); next(); });
    app.use('/api', routes);
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
      console.log('Open http://localhost:' + PORT + ' in your browser');
    });
  } catch (e) {
    console.error('DB init error', e);
    process.exit(1);
  }
})();