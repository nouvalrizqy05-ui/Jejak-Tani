import { useEffect, useState } from 'react';
import { api } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';
import { Search, Filter, ShieldCheck, MapPin, TrendingDown } from 'lucide-react';

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
    <div className="flex flex-col bg-stone-50 min-h-full">
      {/* Hero Section */}
      <section className="relative px-5 pt-8 pb-10 bg-teal-700 text-white overflow-hidden rounded-b-[2.5rem]">
        {/* Subtle mesh background effect */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.4) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(255, 255, 255, 0.3) 0%, transparent 20%)'
        }}></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-4 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Rural Commerce & Supply Chain
          </div>
          
          <h1 className="font-display text-4xl font-semibold leading-tight mb-3">
            Setiap panen <br/>
            punya <span className="text-teal-200 italic">jejak.</span>
          </h1>
          
          <p className="text-teal-50 text-sm leading-relaxed mb-6 opacity-90">
            Terhubung langsung ke petani. Harga transparan, kualitas grading A, riwayat terjamin hingga ke lahan asalnya.
          </p>
          
          <div className="flex gap-3">
            <a href="#marketplace" className="bg-white text-teal-800 px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-teal-900/20 hover:bg-teal-50 transition-colors">
              Mulai Belanja
            </a>
          </div>
        </div>
      </section>

      {/* Feature Highlights (Horizontal Scroll) */}
      <section className="px-5 -mt-6 relative z-20">
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
          <div className="min-w-[240px] bg-white p-4 rounded-2xl shadow-sm border border-stone-100 snap-start shrink-0">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-stone-900 text-sm mb-1">Traceability Penuh</h3>
            <p className="text-xs text-stone-500">Lacak perjalanan produk menggunakan QR Code eksklusif.</p>
          </div>
          <div className="min-w-[240px] bg-white p-4 rounded-2xl shadow-sm border border-stone-100 snap-start shrink-0">
            <div className="w-10 h-10 rounded-full bg-harvest-50 flex items-center justify-center text-harvest-600 mb-3">
              <TrendingDown className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-stone-900 text-sm mb-1">Pangkas Tengkulak</h3>
            <p className="text-xs text-stone-500">Harga langsung dari petani, adil dan menguntungkan dua belah pihak.</p>
          </div>
          <div className="min-w-[240px] bg-white p-4 rounded-2xl shadow-sm border border-stone-100 snap-start shrink-0">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-stone-900 text-sm mb-1">Data Spasial</h3>
            <p className="text-xs text-stone-500">Sistem terhubung langsung dengan lokasi lahan panen.</p>
          </div>
        </div>
      </section>

      {/* Marketplace Section */}
      <section id="marketplace" className="px-5 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold text-stone-900">Etalase Petani</h2>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari beras, sayur..."
              className="w-full bg-white border border-stone-200 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
            />
          </div>
          <div className="relative">
            <select 
              value={kategori} 
              onChange={(e) => setKategori(e.target.value)}
              className="appearance-none bg-white border border-stone-200 rounded-xl py-2.5 pl-4 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-sm"
            >
              <option value="">Semua Kategori</option>
              {kategoriList.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-2xl p-3 border border-stone-100 shadow-sm animate-pulse">
                <div className="w-full aspect-square bg-stone-100 rounded-xl mb-3"></div>
                <div className="h-4 bg-stone-100 rounded-md w-3/4 mb-2"></div>
                <div className="h-3 bg-stone-100 rounded-md w-1/2 mb-4"></div>
                <div className="h-5 bg-stone-100 rounded-md w-full"></div>
              </div>
            ))}
          </div>
        ) : produkList.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-100 border-dashed">
            <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-3 text-stone-300">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-stone-500 text-sm font-medium">Produk tidak ditemukan</p>
            <p className="text-stone-400 text-xs mt-1">Coba kata kunci atau kategori lain.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {produkList.map((p) => <ProductCard key={p.id} produk={p} />)}
          </div>
        )}
      </section>

      {/* Hide scrollbar utility class */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
