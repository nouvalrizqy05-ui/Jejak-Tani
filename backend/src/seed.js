import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, uid } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const QR_DIR = path.join(__dirname, '..', 'data', 'qrcodes');
if (!fs.existsSync(QR_DIR)) fs.mkdirSync(QR_DIR, { recursive: true });

function clearAll() {
  const tables = [
    'rating', 'pengiriman', 'pesanan', 'kontrak_b2b', 'traceability_log',
    'produk', 'lahan', 'petani', 'buyer', 'gudang', 'armada',
    'harga_referensi', 'users'
  ];
  for (const t of tables) db.exec(`DELETE FROM ${t};`);
}

function hash(pw) {
  return bcrypt.hashSync(pw, 10);
}

async function makeQR(produkId) {
  const url = `https://jejaktani.id/trace/${produkId}`;
  const filePath = path.join(QR_DIR, `${produkId}.png`);
  await QRCode.toFile(filePath, url, { width: 400, margin: 1, color: { dark: '#115e59', light: '#ffffff' } });
  return url;
}

async function seed() {
  clearAll();
  console.log('Seeding Jejak Tani demo data...');

  // --- Users & Petani ---
  const petaniSeedData = [
    { nama: 'Pak Slamet Wiyono', desa: 'Desa Sukamaju, Cianjur', komoditas: 'Beras', luas: 1.2 },
    { nama: 'Bu Aminah Sari', desa: 'Desa Tirtajaya, Cianjur', komoditas: 'Cabai Merah', luas: 0.6 },
    { nama: 'Pak Wayan Sudarma', desa: 'Desa Baturiti, Tabanan', komoditas: 'Kopi Arabika', luas: 2.0 },
    { nama: 'Bu Siti Nurjanah', desa: 'Desa Sukamaju, Cianjur', komoditas: 'Sayur Kol', luas: 0.4 },
  ];

  const petaniIds = [];
  for (let i = 0; i < petaniSeedData.length; i++) {
    const p = petaniSeedData[i];
    const userId = uid('usr');
    db.prepare(`INSERT INTO users (id,email,password_hash,role,nama,no_hp) VALUES (?,?,?,?,?,?)`)
      .run(userId, `petani${i + 1}@jejaktani.id`, hash('petani123'), 'petani', p.nama, `08${1000000000 + i}`);
    const petaniId = uid('tani');
    db.prepare(`INSERT INTO petani (id,user_id,nik,alamat,desa) VALUES (?,?,?,?,?)`)
      .run(petaniId, userId, `32010${1000000 + i}`, p.desa, p.desa);
    const lahanId = uid('lhn');
    db.prepare(`INSERT INTO lahan (id,petani_id,luas_ha,lokasi_gps,komoditas) VALUES (?,?,?,?,?)`)
      .run(lahanId, petaniId, p.luas, `-6.8${i} 107.1${i}`, p.komoditas);
    petaniIds.push({ petaniId, lahanId, komoditas: p.komoditas, nama: p.nama, desa: p.desa });
  }

  // --- Gudang & Armada ---
  const gudangCianjur = uid('gdg');
  const gudangTabanan = uid('gdg');
  db.prepare(`INSERT INTO gudang (id,nama,lokasi,lokasi_gps,kapasitas_ton,kapasitas_terpakai_ton) VALUES (?,?,?,?,?,?)`)
    .run(gudangCianjur, 'Gudang Agregasi Cianjur', 'Cianjur, Jawa Barat', '-6.8167, 107.1333', 50, 18.5);
  db.prepare(`INSERT INTO gudang (id,nama,lokasi,lokasi_gps,kapasitas_ton,kapasitas_terpakai_ton) VALUES (?,?,?,?,?,?)`)
    .run(gudangTabanan, 'Gudang Agregasi Tabanan', 'Tabanan, Bali', '-8.3694, 115.1628', 30, 9.2);

  const armadaIds = [];
  const armadaSeed = [
    ['Motor roda tiga', 'D 1234 ABC'],
    ['Truk engkel', 'D 5678 XYZ'],
    ['Truk box pendingin', 'DK 4321 QQ'],
  ];
  for (const [jenis, plat] of armadaSeed) {
    const id = uid('arm');
    db.prepare(`INSERT INTO armada (id,jenis_kendaraan,plat_nomor,status) VALUES (?,?,?,?)`)
      .run(id, jenis, plat, 'tersedia');
    armadaIds.push(id);
  }

  // --- Harga referensi REAL dari PIHPS Bank Indonesia ---
  const hargaJsonPath = path.join(__dirname, '..', 'data', 'harga_pihps.json');
  if (fs.existsSync(hargaJsonPath)) {
    const hargaData = JSON.parse(fs.readFileSync(hargaJsonPath, 'utf-8'));
    console.log(`  Memuat ${hargaData.length} data harga PIHPS (Bank Indonesia)...`);
    const insertHarga = db.prepare(
      `INSERT INTO harga_referensi (id,komoditas,harga_per_kg,tanggal,sumber) VALUES (?,?,?,?,?)`
    );
    db.exec('BEGIN TRANSACTION;');
    for (const h of hargaData) {
      insertHarga.run(uid('hrg'), h.komoditas, h.harga_per_kg, h.tanggal, h.sumber);
    }
    db.exec('COMMIT;');
    console.log('  Data harga PIHPS berhasil dimuat!');
  } else {
    console.warn('  [PERINGATAN] File harga_pihps.json tidak ditemukan. Menggunakan data simulasi...');
    const hargaSeed = [
      ['Beras', 12500], ['Cabai Merah', 38000], ['Cabai Rawit', 45000],
      ['Bawang Merah', 42000], ['Bawang Putih', 38000], ['Daging Ayam', 35000],
      ['Daging Sapi', 130000], ['Telur Ayam', 28000], ['Minyak Goreng', 20000],
      ['Gula Pasir', 18000],
    ];
    for (const [komoditas, basePrice] of hargaSeed) {
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().slice(0, 10);
        const fluctuation = basePrice * (Math.random() * 0.1 - 0.05);
        const finalPrice = Math.round((basePrice + fluctuation) / 100) * 100;
        db.prepare(`INSERT INTO harga_referensi (id,komoditas,harga_per_kg,tanggal,sumber) VALUES (?,?,?,?,?)`)
          .run(uid('hrg'), komoditas, finalPrice, dateString, 'Panel Harga Pangan Nasional (simulasi)');
      }
    }
  }

  // --- Produk + traceability ---
  const today = new Date().toISOString().slice(0, 10);
  const produkSeed = [
    { idx: 0, nama: 'Beras Pandanwangi Premium', kategori: 'Beras', grade: 'A', kg: 400, harga: 13500, emoji: '\u{1F35A}', status: 'dipasarkan' },
    { idx: 1, nama: 'Cabai Merah Keriting', kategori: 'Sayur & Bumbu', grade: 'A', kg: 150, harga: 42000, emoji: '\u{1F336}\uFE0F', status: 'dipasarkan' },
    { idx: 2, nama: 'Kopi Arabika Kintamani', kategori: 'Kopi', grade: 'A', kg: 80, harga: 105000, emoji: '\u2615', status: 'gudang' },
    { idx: 3, nama: 'Kol Segar Panen Pagi', kategori: 'Sayur & Bumbu', grade: 'B', kg: 200, harga: 7000, emoji: '\u{1F958}', status: 'dipasarkan' },
  ];

  const produkIds = [];
  for (const p of produkSeed) {
    const petani = petaniIds[p.idx];
    const produkId = uid('prd');
    const qrUrl = await makeQR(produkId);
    db.prepare(`INSERT INTO produk
      (id,lahan_id,nama,kategori,grade,jumlah_kg,jumlah_terjual_kg,harga_per_kg,tanggal_panen,qr_code,status,deskripsi,foto_emoji)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(produkId, petani.lahanId, p.nama, p.kategori, p.grade, p.kg, Math.round(p.kg * 0.3),
        p.harga, today, qrUrl, p.status,
        `Hasil panen langsung dari ${petani.nama}, ${petani.desa}.`, p.emoji);

    const stages = [
      ['panen', petani.desa, 'Dipanen dan dicatat oleh petani', 28.5, 'Cerah, 28°C', 'Optimal — Suhu lingkungan normal'],
      ['grading', petani.desa, 'Lolos grading kualitas ' + p.grade, 26.2, 'Berawan, 26°C', 'Optimal — Suhu terjaga'],
      ['gudang', p.idx === 2 ? 'Gudang Agregasi Tabanan' : 'Gudang Agregasi Cianjur', 'Diterima dan disimpan di gudang agregasi', 8.0, 'Gudang Berpendingin', 'Optimal — Cold storage aktif 8°C'],
    ];
    if (p.status === 'dipasarkan') {
      stages.push(['dipasarkan', 'Marketplace Jejak Tani', 'Produk tayang di marketplace', 5.5, 'Kontainer Pendingin', 'Optimal — Rantai dingin terjaga 5.5°C']);
    }
    for (const [tahap, lokasi, catatan, suhu, cuaca, kondisi] of stages) {
      db.prepare(`INSERT INTO traceability_log (id,produk_id,tahap,lokasi,catatan,suhu_celcius,cuaca,kondisi_cold_chain) VALUES (?,?,?,?,?,?,?,?)`)
        .run(uid('trc'), produkId, tahap, lokasi, catatan, suhu, cuaca, kondisi);
    }
    produkIds.push(produkId);
  }

  // --- Buyers ---
  const buyerUserB2C = uid('usr');
  db.prepare(`INSERT INTO users (id,email,password_hash,role,nama,no_hp) VALUES (?,?,?,?,?,?)`)
    .run(buyerUserB2C, 'buyer.rumahtangga@jejaktani.id', hash('buyer123'), 'buyer', 'Rina Marlina', '081234567890');
  const buyerB2C = uid('byr');
  db.prepare(`INSERT INTO buyer (id,user_id,tipe,nama_usaha,alamat) VALUES (?,?,?,?,?)`)
    .run(buyerB2C, buyerUserB2C, 'b2c', null, 'Jl. Merdeka No. 10, Bandung');

  const buyerUserB2B = uid('usr');
  db.prepare(`INSERT INTO users (id,email,password_hash,role,nama,no_hp) VALUES (?,?,?,?,?,?)`)
    .run(buyerUserB2B, 'buyer.resto@jejaktani.id', hash('buyer123'), 'buyer', 'Chef Andika (Warung Nusantara)', '081298765432');
  const buyerB2B = uid('byr');
  db.prepare(`INSERT INTO buyer (id,user_id,tipe,nama_usaha,npwp,alamat) VALUES (?,?,?,?,?,?)`)
    .run(buyerB2B, buyerUserB2B, 'b2b', 'Restoran Warung Nusantara', '01.234.567.8-901.000', 'Jl. Braga No. 5, Bandung');

  // --- Admin ---
  const adminId = uid('usr');
  db.prepare(`INSERT INTO users (id,email,password_hash,role,nama) VALUES (?,?,?,?,?)`)
    .run(adminId, 'admin@jejaktani.id', hash('admin123'), 'admin', 'Admin Operasional');

  // --- Contoh kontrak B2B ---
  db.prepare(`INSERT INTO kontrak_b2b (id,buyer_id,komoditas,volume_rutin_kg,frekuensi,harga_terkunci_per_kg,termin_hari,status)
    VALUES (?,?,?,?,?,?,?,?)`)
    .run(uid('ktr'), buyerB2B, 'Beras', 100, 'mingguan', 13000, 14, 'aktif');

  // --- Contoh pesanan selesai (untuk rating) ---
  const pesananId = uid('psn');
  db.prepare(`INSERT INTO pesanan (id,produk_id,buyer_id,jumlah_kg,harga_total,status,tipe_pengiriman,tanggal_pesan)
    VALUES (?,?,?,?,?,?,?,datetime('now','-3 day'))`)
    .run(pesananId, produkIds[0], buyerB2C, 5, 5 * 13500, 'selesai', 'same_day');
  db.prepare(`INSERT INTO pengiriman (id,pesanan_id,gudang_id,armada_id,status,estimasi_tiba)
    VALUES (?,?,?,?,?,datetime('now','-2 day'))`)
    .run(uid('pgr'), pesananId, gudangCianjur, armadaIds[0], 'tiba');
  db.prepare(`INSERT INTO rating (id,pesanan_id,dari_user_id,untuk_user_id,skor,komentar) VALUES (?,?,?,?,?,?)`)
    .run(uid('rtg'), pesananId, buyerUserB2C, db.prepare('SELECT user_id FROM petani WHERE id=?').get(petaniIds[0].petaniId).user_id,
      5, 'Berasnya wangi dan pengiriman cepat, sesuai dengan yang ada di jejak QR!');

  console.log('Seed selesai.');
  console.log('Login demo:');
  console.log('  Petani  : petani1@jejaktani.id / petani123 (lihat juga petani2-4)');
  console.log('  Buyer B2C: buyer.rumahtangga@jejaktani.id / buyer123');
  console.log('  Buyer B2B: buyer.resto@jejaktani.id / buyer123');
  console.log('  Admin   : admin@jejaktani.id / admin123');
}

seed().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
