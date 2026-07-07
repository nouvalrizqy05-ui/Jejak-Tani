import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api.js';
import { formatRupiah, formatDate } from '../utils.js';
import TrustStars from '../components/TrustStars.jsx';
import TraceTimeline from '../components/TraceTimeline.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const [produk, setProduk] = useState(null);
  const [qty, setQty] = useState(1);
  const [sertifikasi, setSertifikasi] = useState([]);
  const [added, setAdded] = useState(false);
  const { user } = useAuth();
  const { addItem } = useCart();

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getProduk(id);
        setProduk(data);
        const cert = await api.getSertifikasiProduk(id);
        setSertifikasi(cert);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [id]);

  if (!produk) return <div className="max-w-5xl mx-auto px-4 py-24 text-center text-stone-400">Memuat produk...</div>;

  const sisa = produk.jumlah_kg - produk.jumlah_terjual_kg;

  const handleAdd = () => {
    addItem(produk, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <Link to="/" className="text-sm text-teal-700 hover:underline">&larr; Kembali ke marketplace</Link>

      <div className="grid md:grid-cols-2 gap-10 mt-6">
        <div>
          <div className="card aspect-square flex items-center justify-center text-9xl bg-gradient-to-br from-teal-50 to-leaf-50">
            {produk.foto_emoji}
          </div>
          <div className="card p-5 mt-5 flex items-center gap-4">
            <img src={`/qrcodes/${produk.id}.png`} alt="QR traceability produk" className="w-24 h-24 rounded-lg border border-stone-200" />
            <div>
              <p className="font-display font-semibold text-stone-900">Jejak digital produk ini</p>
              <div className="flex gap-2 text-sm text-stone-500 mb-6">
                <span className="bg-stone-100 px-3 py-1 rounded-full uppercase tracking-wider text-xs font-bold text-stone-700">
                  Grade {produk.grade}
                </span>
                <span className="bg-teal-50 text-teal-800 px-3 py-1 rounded-full text-xs font-semibold">
                  Sisa {sisa} kg
                </span>
                {sertifikasi.map(cert => (
                  <span key={cert.id} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1" title={cert.penerbit}>
                    🏆 Terverifikasi {cert.jenis}
                  </span>
                ))}
              </div>
              <Link to={`/trace/${produk.id}`} className="text-sm text-teal-700 hover:underline mt-1 inline-block">
                Lihat halaman jejak publik &rarr;
              </Link>
            </div>
          </div>
        </div>

        <div>
          <span className="badge bg-leaf-100 text-leaf-800">Grade {produk.grade}</span>
          <h1 className="font-display text-3xl font-semibold text-stone-900 mt-3">{produk.nama}</h1>
          <div className="flex items-center gap-3 mt-2">
            <TrustStars rataRata={produk.petani?.trust?.rata_rata} jumlah={produk.petani?.trust?.jumlah_ulasan} size="md" />
            <span className="text-stone-300">&bull;</span>
            <span className="text-sm text-stone-500">{produk.petani?.nama}, {produk.petani?.desa}</span>
          </div>
          <p className="text-stone-600 mt-4 leading-relaxed">{produk.deskripsi}</p>

          <div className="mt-6 flex items-baseline gap-2">
            <span className="font-display text-3xl font-semibold text-teal-800">{formatRupiah(produk.harga_per_kg)}</span>
            <span className="text-stone-400">/ kg</span>
          </div>
          <p className="text-sm text-stone-500 mt-1">Sisa stok: {sisa} kg &bull; Dipanen {formatDate(produk.tanggal_panen)}</p>

          {user?.role === 'buyer' ? (
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center border border-stone-300 rounded-full overflow-hidden">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-9 hover:bg-stone-50">&minus;</button>
                <input
                  type="number" min="1" max={sisa} value={qty}
                  onChange={(e) => setQty(Math.min(sisa, Math.max(1, Number(e.target.value))))}
                  className="w-14 text-center outline-none"
                />
                <button onClick={() => setQty((q) => Math.min(sisa, q + 1))} className="w-9 h-9 hover:bg-stone-50">+</button>
              </div>
              <span className="text-sm text-stone-500">kg</span>
              <button onClick={handleAdd} className="btn-primary flex-1" disabled={sisa === 0}>
                {sisa === 0 ? 'Stok habis' : added ? 'Ditambahkan ✓' : 'Tambah ke Keranjang'}
              </button>
            </div>
          ) : !user ? (
            <div className="mt-6">
              <Link to="/masuk" className="btn-primary">Masuk untuk membeli</Link>
            </div>
          ) : (
            <p className="mt-6 text-sm text-stone-500">Masuk sebagai buyer untuk membeli produk ini.</p>
          )}
        </div>
      </div>

      <div className="mt-16">
        <h2 className="font-display text-2xl font-semibold text-stone-900 mb-6">Riwayat Perjalanan Produk</h2>
        <TraceTimeline perjalanan={produk.traceability} />
      </div>
    </div>
  );
}
