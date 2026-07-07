import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/Logo.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(email, password);
      const dest = user.role === 'petani' ? '/petani' : user.role === 'admin' ? '/admin' : location.state?.from || '/';
      navigate(dest);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    ['Petani', 'petani1@jejaktani.id', 'petani123'],
    ['Buyer B2C', 'buyer.rumahtangga@jejaktani.id', 'buyer123'],
    ['Buyer B2B', 'buyer.resto@jejaktani.id', 'buyer123'],
    ['Admin', 'admin@jejaktani.id', 'admin123'],
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6"><Logo size={40} /></div>
        <div className="card p-7">
          <h1 className="font-display text-xl font-semibold text-stone-900 text-center">Masuk ke akun Anda</h1>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
            </div>
            <div>
              <label className="label">Kata sandi</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button disabled={loading} className="btn-primary w-full !py-2.5">{loading ? 'Memproses...' : 'Masuk'}</button>
          </form>
          <p className="text-sm text-stone-500 text-center mt-4">
            Belum punya akun? <Link to="/daftar" className="text-teal-700 font-medium hover:underline">Daftar</Link>
          </p>
        </div>

        <div className="card p-5 mt-4 bg-stone-50">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">Akun demo</p>
          <ul className="text-xs text-stone-500 space-y-1">
            {demoAccounts.map(([label, em, pw]) => (
              <li key={em}>
                <button
                  type="button"
                  onClick={() => { setEmail(em); setPassword(pw); }}
                  className="hover:text-teal-700 underline decoration-dotted"
                >
                  {label}: {em} / {pw}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
