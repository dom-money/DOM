const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbFile = path.join(__dirname, "..", "database.sqlite");

const db = new sqlite3.Database(dbFile, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the SQLite database.");
});

db.serialize(() => {
  db.run(`
      CREATE TABLE IF NOT EXISTS providers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id INTEGER NOT NULL,
        polygon_address TEXT NOT NULL,
        accepted_order INTEGER
      );
    `);

  db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        merchant TEXT NOT NULL,
        amount REAL NOT NULL,
        usdt_amount REAL NOT NULL,
        provider_id INTEGER,
        price_valid_until TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_address TEXT NOT NULL,
        receipt_image TEXT,
        status TEXT NOT NULL,
        qr_data TEXT NOT NULL,
        transaction_hash TEXT,
        relay_transaction TEXT
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        merchant TEXT NOT NULL,
        amount REAL NOT NULL,
        usdt_amount REAL NOT NULL,
        provider_id INTEGER,
        price_valid_until TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        user_address TEXT NOT NULL,
        receipt_image TEXT,
        status TEXT NOT NULL
      );
    `);
});

function saveProvider(telegramId, polygonAddress) {
  return new Promise((resolve, reject) => {
    const query =
      "INSERT INTO providers (telegram_id, polygon_address) VALUES (?, ?)";
    db.run(query, [telegramId, polygonAddress], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
}
function getProvider(telegramId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT polygon_address FROM providers WHERE telegram_id = ?";
    db.get(query, [telegramId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? row.polygon_address : null);
      }
    });
  });
}

function getProviders() {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM providers";
    db.all(query, [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function updateProvider(telegramId, acceptedOrder) {
  return new Promise((resolve, reject) => {
    const query =
      "UPDATE providers SET accepted_order = ? WHERE telegram_id = ?";
    db.run(query, [acceptedOrder, telegramId], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
}

function createOrder(userAddress, pixAddress, amount, usdtAmount, priceValidUntil, qrData) {
  const status = 'created';
  return new Promise((resolve, reject) => {
    const query =
      "INSERT INTO orders (user_address, merchant, amount, usdt_amount, price_valid_until, status, qr_data) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.run(query, [userAddress, pixAddress, amount, usdtAmount, priceValidUntil, status, qrData], function (err) {
      if (err) {
        reject(err);
      } else {
        const insertedId = this.lastID;
        db.get("SELECT * FROM orders WHERE id = ?", [insertedId], (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        });
      }
    });
  });
}

function saveOrder(pixAddress, amount, usdtAmount, status) {
  return new Promise((resolve, reject) => {
    const query =
      "INSERT INTO orders (merchant, amount, usdt_amount, status) VALUES (?, ?, ?, ?)";
    db.run(query, [pixAddress, amount, usdtAmount, status], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
}

function getOrdersByUserAddress(userAddress) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM orders WHERE user_address = ?";
    db.all(query, [userAddress], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function getActionsByUserAndOrder(userAddress, orderId) {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM orders WHERE user_address = ? AND";
    db.all(query, [userAddress], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

function getOrderById(orderId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT orders.*, providers.polygon_address
      FROM orders
      LEFT JOIN providers ON orders.provider_id = providers.telegram_id
      WHERE orders.id = ?
    `;
    db.get(query, [orderId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}



function getProviderTelegramIdByOrderId(orderId) {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT providers.telegram_id
      FROM orders
      INNER JOIN providers ON orders.provider_id = providers.telegram_id
      WHERE orders.id = ?
    `;
    db.get(query, [orderId], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row ? row.telegram_id : null);
      }
    });
  });
}



function updateOrder(orderId, providerId, receiptImage, status) {
  return new Promise((resolve, reject) => {
    const query =
      "UPDATE orders SET provider_id = ?, receipt_image = ?, status = ? WHERE id = ?";
    db.run(query, [providerId, receiptImage, status, orderId], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
}

function updateOrderPrice(orderId, usdtAmount, priceValidUntil) {
  return new Promise((resolve, reject) => {
    const query =
      "UPDATE orders SET usdt_amount = ?, price_valid_until = ? WHERE id = ?";
    db.run(query, [usdtAmount, priceValidUntil, orderId], function (err) {
      if (err) {
        reject(err);
      } else {
        getOrderById(orderId)
        .then(order => resolve(order))
        .catch(err => reject(err));
      }
    });
  });
}

function updateOrderStatus(orderId, status) {
  return new Promise((resolve, reject) => {
    const query = "UPDATE orders SET status = ? WHERE id = ?";
    db.run(query, [status, orderId], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
}

function updateOrderRelayTransaction(orderId, transaction) {
  return new Promise((resolve, reject) => {
    const query = "UPDATE orders SET relay_transaction = ? WHERE id = ?";
    db.run(query, [transaction, orderId], function (err) {
      if (err) {
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
}

module.exports = {
  saveProvider,
  getProviders,
  getProvider,
  updateProvider,
  db,
  createOrder,
  saveOrder,
  getOrdersByUserAddress,
  getProviderTelegramIdByOrderId,
  getOrderById,
  updateOrder,
  updateOrderPrice,
  updateOrderStatus,
  updateOrderRelayTransaction,
};
