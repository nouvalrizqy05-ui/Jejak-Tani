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
    <div className="flex flex-col min-h-full">
      {/* Hero Section */}
      <section className="relative px-5 md:px-12 pt-8 md:pt-16 pb-12 md:pb-20 bg-teal-700 text-white overflow-hidden rounded-b-[2.5rem] md:rounded-b-[4rem]">
        {/* Subtle mesh background effect */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(255, 255, 255, 0.4) 0%, transparent 20%), radial-gradient(circle at 90% 80%, rgba(255, 255, 255, 0.3) 0%, transparent 20%)'
        }}></div>
        
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-4 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            Rural Commerce & Supply Chain
          </div>
          
          <h1 className="font-display text-3xl md:text-6xl font-semibold leading-tight mb-3 md:mb-6">
            Setiap panen{' '}
            punya <span className="text-teal-200 italic">jejak.</span>
          </h1>
          
          <p className="text-teal-50 text-sm md:text-lg leading-relaxed mb-6 md:mb-8 opacity-90 max-w-md md:max-w-xl">
            Terhubung langsung ke petani. Harga transparan, kualitas grading A, riwayat terjamin hingga ke lahan asalnya.
          </p>
          
          <div className="flex gap-3">
            <a href="#marketplace" className="bg-white text-teal-800 px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg shadow-teal-900/20 hover:bg-teal-50 transition-colors">
              Mulai Belanja
            </a>
          </div>
        </div>
      </section>

      {/* Feature Highlights (Horizontal Scroll on Mobile, Grid on Desktop) */}
      <section className="w-full px-5 md:px-12 -mt-6 md:-mt-10 relative z-20 max-w-5xl mx-auto">
        <div className="w-full flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto pb-4 snap-x hide-scrollbar">
          <div className="min-w-[240px] md:min-w-0 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-stone-100 snap-start shrink-0">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-stone-900 text-sm mb-1">Traceability Penuh</h3>
            <p className="text-xs text-stone-500">Lacak perjalanan produk menggunakan QR Code eksklusif.</p>
          </div>
          <div className="min-w-[240px] md:min-w-0 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-stone-100 snap-start shrink-0">
            <div className="w-10 h-10 rounded-full bg-harvest-50 flex items-center justify-center text-harvest-600 mb-3">
              <TrendingDown className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-stone-900 text-sm mb-1">Pangkas Tengkulak</h3>
            <p className="text-xs text-stone-500">Harga langsung dari petani, adil dan menguntungkan dua belah pihak.</p>
          </div>
          <div className="min-w-[240px] md:min-w-0 bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-stone-100 snap-start shrink-0">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mb-3">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-stone-900 text-sm mb-1">Data Spasial</h3>
            <p className="text-xs text-stone-500">Sistem terhubung langsung dengan lokasi lahan panen.</p>
          </div>
        </div>
      </section>

      {/* Marketplace Section */}
      <section id="marketplace" className="px-4 md:px-12 py-6 md:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-8 gap-3">
            <h2 className="font-display text-xl md:text-3xl font-semibold text-stone-900">Etalase Petani</h2>

            {/* Search & Filter Bar */}
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari beras, sayur..."
                  className="w-full bg-white border border-stone-200 rounded-xl py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
                />
              </div>
              <div className="relative shrink-0">
                <select 
                  value={kategori} 
                  onChange={(e) => setKategori(e.target.value)}
                  className="appearance-none bg-white border border-stone-200 rounded-xl py-2.5 pl-3 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-sm"
                >
                  <option value="">Semua</option>
                  {kategoriList.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
                <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {produkList.map((p) => <ProductCard key={p.id} produk={p} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
