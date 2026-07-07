import { Link } from 'react-router-dom';
import { formatRupiah } from '../utils.js';
import TrustStars from './TrustStars.jsx';

const GRADE_COLORS = {
  A: 'bg-leaf-100 text-leaf-800',
  B: 'bg-harvest-100 text-harvest-800',
  C: 'bg-stone-100 text-stone-600',
};

export default function ProductCard({ produk }) {
  const sisa = produk.jumlah_kg - produk.jumlah_terjual_kg;
  return (
    <Link to={`/produk/${produk.id}`} className="card group overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className="aspect-[4/3] bg-gradient-to-br from-teal-50 to-leaf-50 flex items-center justify-center text-6xl">
        {produk.foto_emoji}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display font-semibold text-stone-900 leading-snug">{produk.nama}</h3>
          <span className={`badge shrink-0 ${GRADE_COLORS[produk.grade]}`}>Grade {produk.grade}</span>
        </div>
        <p className="text-xs text-stone-500 mt-1">{produk.petani?.desa}</p>
        <div className="mt-2 flex items-center justify-between">
          <TrustStars rataRata={produk.petani?.trust?.rata_rata} jumlah={produk.petani?.trust?.jumlah_ulasan} />
          <span className="text-xs text-stone-400">Sisa {sisa} kg</span>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="font-display text-lg font-semibold text-teal-800">{formatRupiah(produk.harga_per_kg)}</span>
          <span className="text-xs text-stone-400">/ kg</span>
        </div>
      </div>
    </Link>
  );
}
