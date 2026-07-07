import { useEffect, useState } from 'react';
import { api } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Home() {
  const [produkList, setProdukList] = useState([]);
  const [kategoriList, setKategoriList] = useState([]);
  const [kategori, setKategori] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listKategori().then(setKategoriList).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (kategori) params.kategori = kategori;
    if (search) params.search = search;
    api.listProduk(params).then(setProdukList).finally(() => setLoading(false));
  }, [kategori, search]);

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-50 via-white to-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="badge bg-teal-100 text-teal-800 mb-5">Rural Commerce &amp; Supply Chain</span>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.1] text-stone-900">
              Setiap panen<br />punya <span className="text-teal-700">jejak</span>.
            </h1>
            <p className="mt-5 text-stone-600 text-lg leading-relaxed max-w-md">
              Kami memotong jalur tengkulak berlapis. Petani pelosok terhubung langsung ke
              pembeli, dengan harga transparan dan riwayat produk yang bisa ditelusuri sampai ke ladang asalnya.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#marketplace" className="btn-primary">Jelajahi Produk</a>
              <a href="/jadi-mitra" className="btn-secondary">Jadi Mitra Petani</a>
            </div>
          </div>
          <div className="relative">
            <div className="card p-6 rotate-1">
              <p className="label">Jejak Produk</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-2xl">🍚</div>
                <div>
                  <p className="font-display font-semibold text-stone-900">Beras Pandanwangi Premium</p>
                  <p className="text-xs text-stone-500">Desa Sukamaju, Cianjur</p>
                </div>
              </div>
              <div className="space-y-2">
                {['Dipanen', 'Lolos Grading A', 'Masuk Gudang', 'Tayang di Marketplace'].map((s, i) => (
                  <div key={s} className="flex items-center gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-teal-700 text-white text-[10px] flex items-center justify-center font-bold">{i + 1}</span>
                    <span className="text-stone-600">{s}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 card p-3 -rotate-3 bg-harvest-50 border-harvest-200">
              <p className="text-xs font-semibold text-harvest-800">Harga adil, tanpa tengkulak berlapis</p>
            </div>
          </div>
        </div>
      </section>

      <section id="marketplace" className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-2xl font-semibold text-stone-900">Marketplace</h2>
            <p className="text-stone-500 text-sm mt-1">Langsung dari petani, sudah lolos grading kualitas.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari produk..."
              className="input !w-56"
            />
            <select value={kategori} onChange={(e) => setKategori(e.target.value)} className="input !w-48">
              <option value="">Semua kategori</option>
              {kategoriList.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-stone-400">Memuat produk...</div>
        ) : produkList.length === 0 ? (
          <div className="text-center py-20 text-stone-400">Belum ada produk untuk filter ini.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {produkList.map((p) => <ProductCard key={p.id} produk={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
