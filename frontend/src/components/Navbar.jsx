import { Link, NavLink, useNavigate } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const linkClass = ({ isActive }) =>
  `px-4 py-2 text-sm font-semibold rounded-full transition-all ${
    isActive ? 'bg-teal-100 text-teal-800' : 'text-stone-600 hover:text-teal-800 hover:bg-stone-100'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const dashboardPath = user?.role === 'petani' ? '/petani' : user?.role === 'admin' ? '/admin' : '/akun';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200 shadow-sm w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" aria-label="Beranda Jejak Tani" className="flex items-center gap-2">
          <Logo size={32} />
          <span className="hidden md:block font-display font-bold text-xl text-stone-900 tracking-tight">Jejak Tani</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          <NavLink to="/" end className={linkClass}>Beranda</NavLink>
          <NavLink to="/harga" className={linkClass}>Harga Referensi</NavLink>
          <NavLink to="/trace" className={linkClass}>Traceability</NavLink>
          {user?.role !== 'petani' && <NavLink to="/jadi-mitra" className={linkClass}>Jadi Mitra</NavLink>}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          {user?.role === 'buyer' && (
            <Link to="/keranjang" className="relative p-2 text-stone-600 hover:bg-stone-100 hover:text-teal-700 transition-colors rounded-full" aria-label="Keranjang">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1.4" fill="currentColor" stroke="none" />
                <circle cx="18" cy="21" r="1.4" fill="currentColor" stroke="none" />
                <path d="M2.5 3h2l2.4 12.2a2 2 0 002 1.6h8.2a2 2 0 002-1.6L20.5 7H6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {items.length > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-harvest-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {items.length}
                </span>
              )}
            </Link>
          )}

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center gap-3 border-l border-stone-200 pl-4 ml-2">
            {user ? (
              <>
                <Link to={dashboardPath} className="text-sm font-semibold text-stone-700 hover:text-teal-700 transition-colors">
                  {user.nama.split(' ')[0]}
                </Link>
                <button onClick={() => { logout(); navigate('/'); }} className="btn-secondary !px-4 !py-1.5 !text-xs">
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link to="/masuk" className="text-sm font-semibold text-stone-600 hover:text-teal-700 transition-colors">Masuk</Link>
                <Link to="/daftar" className="btn-primary !px-5 !py-2 !text-sm">Gabung</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
