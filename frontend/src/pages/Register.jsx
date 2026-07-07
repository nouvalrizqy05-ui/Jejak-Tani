import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../components/Logo.jsx';

export default function Register() {
  const [role, setRole] = useState('buyer');
  const [form, setForm] = useState({
    nama: '', email: '', password: '', no_hp: '', desa: '', alamat: '', tipe_buyer: 'b2c', nama_usaha: '', npwp: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await register({ ...form, role });
      navigate(role === 'petani' ? '/petani' : '/');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-10 min-h-full">
      <div className="w-full">
        <div className="flex justify-center mb-6"><Logo size={48} /></div>
        
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-stone-100 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-harvest-100 text-harvest-800 text-[10px] font-bold rounded-full uppercase tracking-widest border border-white">Pendaftaran</div>
          <h1 className="font-display text-2xl font-bold text-stone-900 text-center mt-2">Gabung Jejak Tani</h1>

          <div className="flex gap-2 mt-6 p-1 bg-stone-100 rounded-xl">
            <button type="button" onClick={() => setRole('buyer')}
              className={`flex-1 rounded-lg text-sm font-semibold py-2.5 transition-all ${role === 'buyer' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'}`}>
              Pembeli
            </button>
            <button type="button" onClick={() => setRole('petani')}
              className={`flex-1 rounded-lg text-sm font-semibold py-2.5 transition-all ${role === 'petani' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'}`}>
              Petani
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <div>
              <label className="label">Nama lengkap</label>
              <input required value={form.nama} onChange={set('nama')} className="input" />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" required value={form.email} onChange={set('email')} className="input" />
            </div>
            <div>
              <label className="label">Kata sandi</label>
              <input type="password" required minLength={6} value={form.password} onChange={set('password')} className="input" />
            </div>
            <div>
              <label className="label">Nomor HP / WhatsApp</label>
              <input value={form.no_hp} onChange={set('no_hp')} className="input" placeholder="08xxxxxxxxxx" />
            </div>

            {role === 'petani' ? (
              <>
                <div>
                  <label className="label">Desa &amp; kabupaten</label>
                  <input value={form.desa} onChange={set('desa')} className="input" placeholder="Desa Sukamaju, Cianjur" />
                </div>
                <div>
                  <label className="label">Alamat lengkap</label>
                  <input value={form.alamat} onChange={set('alamat')} className="input" />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="label">Tipe pembeli</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setForm((f) => ({ ...f, tipe_buyer: 'b2c' }))}
                      className={`flex-1 btn-secondary !rounded-xl text-xs !py-2 ${form.tipe_buyer === 'b2c' ? '!bg-teal-700 !text-white !border-teal-700' : ''}`}>
                      Rumah tangga (B2C)
                    </button>
                    <button type="button" onClick={() => setForm((f) => ({ ...f, tipe_buyer: 'b2b' }))}
                      className={`flex-1 btn-secondary !rounded-xl text-xs !py-2 ${form.tipe_buyer === 'b2b' ? '!bg-teal-700 !text-white !border-teal-700' : ''}`}>
                      Bisnis (B2B)
                    </button>
                  </div>
                </div>
                {form.tipe_buyer === 'b2b' && (
                  <>
                    <div>
                      <label className="label">Nama usaha</label>
                      <input value={form.nama_usaha} onChange={set('nama_usaha')} className="input" placeholder="Restoran, hotel, ritel..." />
                    </div>
                    <div>
                      <label className="label">NPWP</label>
                      <input value={form.npwp} onChange={set('npwp')} className="input" />
                    </div>
                  </>
                )}
                <div>
                  <label className="label">Alamat pengiriman</label>
                  <input value={form.alamat} onChange={set('alamat')} className="input" />
                </div>
              </>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}
            <button disabled={loading} className="btn-primary w-full !py-2.5 mt-2">{loading ? 'Memproses...' : 'Daftar'}</button>
          </form>
          <p className="text-sm text-stone-500 text-center mt-4">
            Sudah punya akun? <Link to="/masuk" className="text-teal-700 font-medium hover:underline">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
