import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = path.join(DATA_DIR, 'jejaktani.db');

export const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('petani','buyer','admin','agen')),
  nama TEXT NOT NULL,
  no_hp TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS petani (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  nik TEXT,
  alamat TEXT,
  desa TEXT,
  tanggal_daftar TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sertifikasi_produk (
  id TEXT PRIMARY KEY,
  produk_id TEXT NOT NULL,
  jenis TEXT NOT NULL,
  nomor_sertifikat TEXT NOT NULL,
  penerbit TEXT NOT NULL,
  tanggal_terbit TEXT NOT NULL,
  tanggal_kadaluarsa TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  diverifikasi_oleh TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (produk_id) REFERENCES produk (id)
);

CREATE TABLE IF NOT EXISTS lahan (
  id TEXT PRIMARY KEY,
  petani_id TEXT NOT NULL REFERENCES petani(id),
  luas_ha REAL,
  lokasi_gps TEXT,
  komoditas TEXT
);

CREATE TABLE IF NOT EXISTS produk (
  id TEXT PRIMARY KEY,
  lahan_id TEXT NOT NULL REFERENCES lahan(id),
  nama TEXT NOT NULL,
  kategori TEXT NOT NULL,
  grade TEXT NOT NULL CHECK(grade IN ('A','B','C')),
  jumlah_kg REAL NOT NULL,
  jumlah_terjual_kg REAL NOT NULL DEFAULT 0,
  harga_per_kg REAL NOT NULL,
  tanggal_panen TEXT NOT NULL,
  qr_code TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'panen' CHECK(status IN ('panen','grading','gudang','dipasarkan','habis')),
  deskripsi TEXT,
  foto_emoji TEXT DEFAULT '\u{1F955}',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS traceability_log (
  id TEXT PRIMARY KEY,
  produk_id TEXT NOT NULL REFERENCES produk(id),
  tahap TEXT NOT NULL,
  lokasi TEXT,
  catatan TEXT,
  suhu_celcius REAL,
  cuaca TEXT,
  kondisi_cold_chain TEXT,
  waktu TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS buyer (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  tipe TEXT NOT NULL CHECK(tipe IN ('b2c','b2b')),
  nama_usaha TEXT,
  npwp TEXT,
  alamat TEXT
);

CREATE TABLE IF NOT EXISTS gudang (
  id TEXT PRIMARY KEY,
  nama TEXT NOT NULL,
  lokasi TEXT NOT NULL,
  kapasitas_ton REAL NOT NULL,
  kapasitas_terpakai_ton REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS armada (
  id TEXT PRIMARY KEY,
  jenis_kendaraan TEXT NOT NULL,
  plat_nomor TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'tersedia' CHECK(status IN ('tersedia','bertugas','perbaikan'))
);

CREATE TABLE IF NOT EXISTS pesanan (
  id TEXT PRIMARY KEY,
  produk_id TEXT NOT NULL REFERENCES produk(id),
  buyer_id TEXT NOT NULL REFERENCES buyer(id),
  jumlah_kg REAL NOT NULL,
  harga_total REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'menunggu_pembayaran'
    CHECK(status IN ('menunggu_pembayaran','dibayar','disiapkan','dikirim','selesai','dibatalkan')),
  tipe_pengiriman TEXT DEFAULT 'reguler' CHECK(tipe_pengiriman IN ('same_day','reguler','tanpa_kontak')),
  catatan_alamat TEXT,
  tanggal_pesan TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pengiriman (
  id TEXT PRIMARY KEY,
  pesanan_id TEXT NOT NULL REFERENCES pesanan(id),
  gudang_id TEXT REFERENCES gudang(id),
  armada_id TEXT REFERENCES armada(id),
  status TEXT NOT NULL DEFAULT 'menunggu' CHECK(status IN ('menunggu','dalam_perjalanan','tiba')),
  estimasi_tiba TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS kontrak_b2b (
  id TEXT PRIMARY KEY,
  buyer_id TEXT NOT NULL REFERENCES buyer(id),
  komoditas TEXT NOT NULL,
  volume_rutin_kg REAL NOT NULL,
  frekuensi TEXT NOT NULL CHECK(frekuensi IN ('mingguan','dwi_mingguan','bulanan')),
  harga_terkunci_per_kg REAL NOT NULL,
  termin_hari INTEGER NOT NULL DEFAULT 14,
  status TEXT NOT NULL DEFAULT 'aktif' CHECK(status IN ('aktif','selesai','dibatalkan')),
  tanggal_mulai TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rating (
  id TEXT PRIMARY KEY,
  pesanan_id TEXT NOT NULL REFERENCES pesanan(id),
  dari_user_id TEXT NOT NULL REFERENCES users(id),
  untuk_user_id TEXT NOT NULL REFERENCES users(id),
  skor INTEGER NOT NULL CHECK(skor BETWEEN 1 AND 5),
  komentar TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS harga_referensi (
  id TEXT PRIMARY KEY,
  komoditas TEXT NOT NULL,
  harga_per_kg REAL NOT NULL,
  tanggal TEXT NOT NULL,
  sumber TEXT NOT NULL DEFAULT 'Panel Harga Pangan Nasional'
);

CREATE TABLE IF NOT EXISTS sengketa (
  id TEXT PRIMARY KEY,
  pesanan_id TEXT NOT NULL REFERENCES pesanan(id),
  diajukan_oleh TEXT NOT NULL REFERENCES users(id),
  alasan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','selesai')),
  resolusi TEXT,
  admin_id TEXT REFERENCES users(id),
  created_at TEXT DEFAULT (datetime('now')),
  resolved_at TEXT
);
`);

export function uid(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}
