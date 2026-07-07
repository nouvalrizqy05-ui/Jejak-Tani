import { Link, NavLink, useNavigate } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const linkClass = ({ isActive }) =>
  `px-3 py-2 text-sm font-medium rounded-full transition ${
    isActive ? 'bg-teal-50 text-teal-800' : 'text-stone-600 hover:text-teal-800 hover:bg-stone-50'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const dashboardPath =
    user?.role === 'petani' ? '/petani' : user?.role === 'admin' ? '/admin' : user?.role === 'buyer' ? '/akun' : null;

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-stone-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" aria-label="Beranda Jejak Tani">
          <Logo size={32} />
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>Marketplace</NavLink>
          <NavLink to="/harga" className={linkClass}>Harga Referensi</NavLink>
          {user?.role !== 'petani' && <NavLink to="/jadi-mitra" className={linkClass}>Jadi Mitra Petani</NavLink>}
        </nav>
        <div className="flex items-center gap-2">
          {user?.role === 'buyer' && (
            <Link to="/keranjang" className="relative btn-ghost !px-3" aria-label="Keranjang">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="9" cy="21" r="1.4" fill="currentColor" stroke="none" />
                <circle cx="18" cy="21" r="1.4" fill="currentColor" stroke="none" />
                <path d="M2.5 3h2l2.4 12.2a2 2 0 002 1.6h8.2a2 2 0 002-1.6L20.5 7H6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {items.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-harvest-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-2">
              {dashboardPath && (
                <Link to={dashboardPath} className="btn-secondary !py-2">
                  {user.nama.split(' ')[0]}
                </Link>
              )}
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="btn-ghost !py-2"
              >
                Keluar
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/masuk" className="btn-ghost">Masuk</Link>
              <Link to="/daftar" className="btn-primary">Gabung Sekarang</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
