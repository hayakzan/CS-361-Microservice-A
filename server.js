// server.js
const express  = require('express');
const cors     = require('cors');
const sqlite3  = require('sqlite3').verbose();
const { open } = require('sqlite');

async function startService() {
  // Open (or create) the SQLite database
  const db = await open({
    filename: './keys.db',
    driver: sqlite3.Database
  });

  // Ensure our table exists
  await db.exec(`
    CREATE TABLE IF NOT EXISTS key_mappings (
      key        TEXT PRIMARY KEY,
      room_id    INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const app = express();
  app.use(cors());
  app.use(express.json());

  /**
   * GET /api/keys/validate?key=<KEY>
   *
   * Response:
   *   200 OK  { valid: true,  roomId: <number> }
   *   404 Not Found { valid: false, error: "Key not found" }
   *   503 Service Unavailable { error: "Database unavailable—please try again later." }
   */
  app.get('/api/keys/validate', async (req, res) => {
    const key = req.query.key;
    if (!key) {
      return res
        .status(400)
        .json({ error: 'Key query parameter is required' });
    }

    try {
      const row = await db.get(
        `SELECT room_id FROM key_mappings WHERE key = ?`,
        key
      );

      if (row) {
        return res.json({ valid: true, roomId: row.room_id });
      } else {
        return res
          .status(404)
          .json({ valid: false, error: 'Key not found' });
      }
    } catch (err) {
      console.error('Database error:', err);
      return res
        .status(503)
        .json({ error: 'Database unavailable—please try again later.' });
    }
  });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () =>
    console.log(`🔑 Key-Validation Service listening on port ${PORT}`)
  );
}

startService().catch(err => {
  console.error('Failed to start service:', err);
  process.exit(1);
});

