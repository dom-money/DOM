import { Database } from 'sqlite3';
import path from 'path';

class DbService {
  db: Database | null;

  constructor() {
    this.db = null;
  }

  public open() {
    const dbFile = path.join(__dirname, '..', '..', 'database.sqlite');
    this.db = new Database(dbFile, (err: Error) => {
      if (err) {
        console.error(err.message);
      }
      this.serialize();
      console.log('Connected to the SQLite database.');
    });
  }

  public close() {
    this.db.close((err: Error) => {
      if (err) {
        console.error(err.message);
      }
      console.log('Disconnected from the SQLite database.');
    });
  }

  private serialize() {
    this.db.serialize(() => {
      this.db.run(`
          CREATE TABLE IF NOT EXISTS providers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            telegram_id INTEGER NOT NULL,
            polygon_address TEXT NOT NULL,
            accepted_order INTEGER
          );
        `);

      this.db.run(`
          CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            merchant TEXT NOT NULL,
            amount REAL NOT NULL,
            usdt_amount REAL NOT NULL,
            provider_id INTEGER,
            receipt_image TEXT,
            status TEXT NOT NULL
          );
        `);
    });
  }
}

export const dbService = new DbService();
