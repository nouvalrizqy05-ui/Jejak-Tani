import { Link, NavLink, useNavigate } from 'react-router-dom';
import Logo from './Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

const linkClass = ({ isActive }) =>
  `px-3 py-2 text-sm font-medium rounded-full transition ${
    isActive ? 'bg-teal-50 text-teal-800' : 'text-stone-600 hover:text-teal-800 hover:bg-stone-50'
  }`;

export default function Navbar() {
  const { user } = useAuth();
  const { items } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-stone-200 shadow-sm">
      <div className="px-4 h-14 flex items-center justify-between">
        <Link to="/" aria-label="Beranda Jejak Tani">
          <Logo size={28} />
        </Link>
        <div className="flex items-center gap-2">
          {user?.role === 'buyer' && (
            <Link to="/keranjang" className="relative p-2 text-stone-600 hover:bg-stone-100 rounded-full" aria-label="Keranjang">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1.4" fill="currentColor" stroke="none" />
                <circle cx="18" cy="21" r="1.4" fill="currentColor" stroke="none" />
                <path d="M2.5 3h2l2.4 12.2a2 2 0 002 1.6h8.2a2 2 0 002-1.6L20.5 7H6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {items.length > 0 && (
                <span className="absolute top-1 right-1 bg-harvest-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
