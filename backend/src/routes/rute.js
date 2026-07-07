import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

// Helper menghitung jarak linear (Haversine formula sederhana)
function hitungJarakKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius bumi dalam km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// GET /api/rute/optimasi - Mengoptimalkan rute armada untuk pengiriman yang menunggu
router.get('/optimasi', requireAuth, requireRole('admin'), (req, res) => {
  try {
    // Ambil pengiriman yang statusnya menunggu atau dikirim
    const pengiriman = db.prepare(`
      SELECT pg.*, p.jumlah_kg, p.catatan_alamat, 
             pr.nama as produk_nama, 
             l.lokasi_gps as lahan_gps
      FROM pengiriman pg
      JOIN pesanan p ON pg.pesanan_id = p.id
      JOIN produk pr ON p.produk_id = pr.id
      JOIN lahan l ON pr.lahan_id = l.id
      WHERE pg.status = 'menunggu' OR pg.status = 'dikirim'
    `).all();

    // Default gudang pusat (misal Jakarta jika kosong, atau ambil dari gudang_id 1)
    const gudangPusat = { lat: -6.200000, lon: 106.816666 }; 
    const gudangPertama = db.prepare('SELECT lokasi_gps FROM gudang LIMIT 1').get();
    if (gudangPertama && gudangPertama.lokasi_gps) {
      const parts = gudangPertama.lokasi_gps.split(',');
      if (parts.length === 2) {
        gudangPusat.lat = parseFloat(parts[0]);
        gudangPusat.lon = parseFloat(parts[1]);
      }
    }

    const rute = pengiriman.map(kirim => {
      let jarak = 0;
      if (kirim.lahan_gps) {
        const parts = kirim.lahan_gps.split(',');
        if (parts.length === 2) {
          jarak = hitungJarakKm(
            gudangPusat.lat, gudangPusat.lon, 
            parseFloat(parts[0]), parseFloat(parts[1])
          );
        }
      }
      return {
        ...kirim,
        jarak_ke_gudang_km: Math.round(jarak * 10) / 10
      };
    });

    // Urutkan dari yang terdekat
    rute.sort((a, b) => a.jarak_ke_gudang_km - b.jarak_ke_gudang_km);

    res.json({ rute });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Terjadi kesalahan saat kalkulasi rute.' });
  }
});

export default router;
