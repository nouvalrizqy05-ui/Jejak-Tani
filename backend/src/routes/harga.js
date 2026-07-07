import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

// GET /api/harga - latest reference price per commodity
router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT komoditas, harga_per_kg, tanggal, sumber
    FROM harga_referensi
    GROUP BY komoditas
    ORDER BY komoditas ASC
  `).all();
  res.json(rows);
});

router.get('/:komoditas', (req, res) => {
  const row = db.prepare(`SELECT * FROM harga_referensi WHERE komoditas = ? ORDER BY tanggal DESC LIMIT 1`)
    .get(req.params.komoditas);
  if (!row) return res.status(404).json({ error: 'Data harga referensi belum tersedia untuk komoditas ini.' });
  res.json(row);
});

router.get('/historis/:komoditas', (req, res) => {
  const rows = db.prepare(`SELECT * FROM harga_referensi WHERE komoditas = ? ORDER BY tanggal ASC`)
    .all(req.params.komoditas);
  res.json(rows);
});

export default router;
