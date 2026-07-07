import { NavLink } from 'react-router-dom';
import { Home, LineChart, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { cn } from '../utils.js';

export default function BottomNav() {
  const { user } = useAuth();
  
  const dashboardPath = user?.role === 'petani' ? '/petani' : user?.role === 'admin' ? '/admin' : '/akun';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="w-full max-w-md bg-white border-t border-stone-200 flex items-center justify-around pb-safe pointer-events-auto h-16 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <NavLink 
          to="/" 
          end
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center w-1/4 h-full gap-1 transition-colors",
            isActive ? "text-teal-700" : "text-stone-400 hover:text-stone-600"
          )}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Beranda</span>
        </NavLink>
        
        <NavLink 
          to="/harga" 
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center w-1/4 h-full gap-1 transition-colors",
            isActive ? "text-teal-700" : "text-stone-400 hover:text-stone-600"
          )}
        >
          <LineChart className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Harga</span>
        </NavLink>
        
        <NavLink 
          to="/trace" 
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center w-1/4 h-full gap-1 transition-colors",
            isActive ? "text-teal-700" : "text-stone-400 hover:text-stone-600"
          )}
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Lacak</span>
        </NavLink>
        
        <NavLink 
          to={user ? dashboardPath : "/masuk"} 
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center w-1/4 h-full gap-1 transition-colors",
            isActive ? "text-teal-700" : "text-stone-400 hover:text-stone-600"
          )}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-semibold">{user ? 'Akun' : 'Masuk'}</span>
        </NavLink>
      </div>
    </nav>
  );
}
