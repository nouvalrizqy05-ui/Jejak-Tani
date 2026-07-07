import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatRupiah, formatDateTime, STATUS_PESANAN_LABELS } from '../utils.js';

const STATUS_COLORS = {
  menunggu_pembayaran: 'bg-harvest-100 text-harvest-800',
  dibayar: 'bg-teal-100 text-teal-800',
  disiapkan: 'bg-teal-100 text-teal-800',
  dikirim: 'bg-leaf-100 text-leaf-800',
  selesai: 'bg-stone-100 text-stone-600',
  dibatalkan: 'bg-red-100 text-red-700',
};

function PesananTab({ token, sengketa, setSengketa, setSengketaForm, ajukanSengketa }) {
  const [pesanan, setPesanan] = useState([]);
  const [ratingFor, setRatingFor] = useState(null);
  const [skor, setSkor] = useState(5);
  const [komentar, setKomentar] = useState('');
  const location = useLocation();

  const load = () => api.myPesanan(token).then(setPesanan);
  useEffect(() => { load(); }, [token]);

  const submitRating = async (pesananId, untukUserId) => {
    await api.createRating({ pesanan_id: pesananId, untuk_user_id: untukUserId, skor, komentar }, token);
    setRatingFor(null);
    setKomentar('');
    load();
  };

  const terimaPesanan = async (id) => {
    await api.updatePesanan(id, { status: 'selesai' }, token);
    load();
  };

  return (
    <div className="space-y-3">
      {location.state?.justOrdered && (
        <div className="card p-4 bg-leaf-50 border-leaf-200 text-leaf-800 text-sm">
          Pesanan berhasil dibuat dan pembayaran terkonfirmasi (simulasi).
        </div>
      )}
      {pesanan.length === 0 && <p className="text-stone-400 text-sm">Belum ada pesanan.</p>}
      {pesanan.map((p) => (
        <div key={p.id} className="card p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-2xl">{p.foto_emoji}</div>
            <div className="flex-1 min-w-[180px]">
              <p className="font-display font-semibold text-stone-900">{p.produk_nama}</p>
              <p className="text-xs text-stone-500">{p.jumlah_kg} kg &bull; {formatRupiah(p.harga_total)} &bull; {formatDateTime(p.tanggal_pesan)}</p>
              <p className="text-xs text-stone-400">Petani: {p.petani_nama}</p>
            </div>
            <span className={`badge ${STATUS_COLORS[p.status]}`}>{STATUS_PESANAN_LABELS[p.status]}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-stone-100 flex flex-wrap gap-2">
            {p.status === 'selesai' && (
              <>
                {ratingFor === p.id ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <select value={skor} onChange={(e) => setSkor(Number(e.target.value))} className="input !w-24">
                      {[5, 4, 3, 2, 1].map((s) => <option key={s} value={s}>{s} bintang</option>)}
                    </select>
                    <input value={komentar} onChange={(e) => setKomentar(e.target.value)} placeholder="Komentar (opsional)" className="input flex-1 !w-40" />
                    <button onClick={() => submitRating(p.id, p.petani_user_id)} className="btn-primary !py-1.5 text-xs">Kirim</button>
                  </div>
                ) : (
                  <button onClick={() => setRatingFor(p.id)} className="text-sm text-teal-700 hover:underline">Beri ulasan &rarr;</button>
                )}
              </>
            )}
            <div className="flex gap-2 w-full sm:w-auto">
              {p.status === 'menunggu_pembayaran' && <button onClick={() => window.location.href='/cart'} className="btn-primary !py-1 text-sm flex-1">Bayar</button>}
              {p.status === 'dikirim' && <button onClick={() => terimaPesanan(p.id)} className="btn-secondary !py-1 text-sm flex-1 !text-teal-700 !border-teal-700 hover:!bg-teal-50">Pesanan Diterima</button>}
              {['selesai', 'dibatalkan', 'dikirim'].includes(p.status) && (
                <button onClick={() => setSengketaForm({open: true, pesananId: p.id, alasan: ''})} className="btn-secondary !py-1 text-sm flex-1 !text-red-700 !border-red-700 hover:!bg-red-50">Ajukan Komplain</button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function KontrakTab() {
  const { token } = useAuth();
  const [kontrak, setKontrak] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ komoditas: '', volume_rutin_kg: '', frekuensi: 'mingguan', harga_terkunci_per_kg: '', termin_hari: 14 });
  const [error, setError] = useState('');

  const load = () => api.myKontrak(token).then(setKontrak);
  useEffect(() => { load(); }, [token]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.createKontrak({
        ...form,
        volume_rutin_kg: Number(form.volume_rutin_kg),
        harga_terkunci_per_kg: Number(form.harga_terkunci_per_kg),
        termin_hari: Number(form.termin_hari),
      }, token);
      setShowForm(false);
      setForm({ komoditas: '', volume_rutin_kg: '', frekuensi: 'mingguan', harga_terkunci_per_kg: '', termin_hari: 14 });
      load();
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={() => setShowForm((s) => !s)} className="btn-secondary text-sm">
          {showForm ? 'Batal' : '+ Buat Kontrak Berulang'}
        </button>
      </div>
      {showForm && (
        <form onSubmit={submit} className="card p-5 mb-6 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Komoditas</label>
              <input required value={form.komoditas} onChange={(e) => setForm((f) => ({ ...f, komoditas: e.target.value }))} className="input" placeholder="Beras" />
            </div>
            <div>
              <label className="label">Volume rutin (kg)</label>
              <input required type="number" value={form.volume_rutin_kg} onChange={(e) => setForm((f) => ({ ...f, volume_rutin_kg: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Frekuensi</label>
              <select value={form.frekuensi} onChange={(e) => setForm((f) => ({ ...f, frekuensi: e.target.value }))} className="input">
                <option value="mingguan">Mingguan</option>
                <option value="dwi_mingguan">Dwi-mingguan</option>
                <option value="bulanan">Bulanan</option>
              </select>
            </div>
            <div>
              <label className="label">Harga terkunci per kg (Rp)</label>
              <input required type="number" value={form.harga_terkunci_per_kg} onChange={(e) => setForm((f) => ({ ...f, harga_terkunci_per_kg: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="label">Termin pembayaran (hari)</label>
              <select value={form.termin_hari} onChange={(e) => setForm((f) => ({ ...f, termin_hari: e.target.value }))} className="input">
                <option value={7}>7 hari</option>
                <option value={14}>14 hari</option>
                <option value={30}>30 hari</option>
              </select>
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-primary">Simpan Kontrak</button>
        </form>
      )}
      <div className="space-y-3">
        {kontrak.length === 0 && <p className="text-stone-400 text-sm">Belum ada kontrak berulang.</p>}
        {kontrak.map((k) => (
          <div key={k.id} className="card p-4 flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[180px]">
              <p className="font-display font-semibold text-stone-900">{k.komoditas}</p>
              <p className="text-xs text-stone-500">
                {k.volume_rutin_kg} kg / {k.frekuensi.replace('_', '-')} &bull; {formatRupiah(k.harga_terkunci_per_kg)}/kg &bull; termin {k.termin_hari} hari
              </p>
            </div>
            <span className="badge bg-teal-50 text-teal-800 capitalize">{k.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Akun() {
  const { token, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('pesanan');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pesanan, setPesanan] = useState([]);
  const [sengketa, setSengketa] = useState([]);
  const [sengketaForm, setSengketaForm] = useState({ open: false, pesananId: null, alasan: '' });
  const isB2B = profile?.tipe === 'b2b';

  const ajukanSengketa = async (e) => {
    e.preventDefault();
    try {
      await api.createSengketa({ pesanan_id: sengketaForm.pesananId, alasan: sengketaForm.alasan }, token);
      setSengketaForm({ open: false, pesananId: null, alasan: '' });
      const sgk = await api.mySengketa(token);
      setSengketa(sgk);
      alert('Sengketa berhasil diajukan dan akan diproses admin.');
    } catch(e) {
      alert(e.message);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const data = await api.me(token);
        setUser(data);
        if (data.role === 'buyer') {
          const pes = await api.myPesanan(token);
          setPesanan(pes);
          try {
            const sgk = await api.mySengketa(token);
            setSengketa(sgk);
          } catch(e) {}
        }
      } catch (err) {
        logout();
        navigate('/login');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [token, logout, navigate]);

  if (loading || !user) return <div className="max-w-3xl mx-auto px-4 py-24 text-center text-stone-400">Memuat profil...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-stone-900 mb-6">Akun Saya</h1>
      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('pesanan')} className={`btn-secondary !rounded-xl ${tab === 'pesanan' ? '!bg-teal-700 !text-white !border-teal-700' : ''}`}>Riwayat Pesanan</button>
        <button onClick={() => setTab('sengketa')} className={`btn-secondary !rounded-xl ${tab === 'sengketa' ? '!bg-teal-700 !text-white !border-teal-700' : ''}`}>Sengketa</button>
        {isB2B && <button onClick={() => setTab('kontrak')} className={`btn-secondary !rounded-xl ${tab === 'kontrak' ? '!bg-teal-700 !text-white !border-teal-700' : ''}`}>Kontrak Berulang</button>}
      </div>

      {tab === 'pesanan' && <PesananTab token={token} sengketa={sengketa} setSengketa={setSengketa} setSengketaForm={setSengketaForm} ajukanSengketa={ajukanSengketa} />}
      {tab === 'kontrak' && <KontrakTab />}
      {tab === 'sengketa' && (
        <div className="space-y-4">
          {sengketa.length === 0 ? <p className="text-stone-400">Tidak ada sengketa / komplain.</p> : null}
          {sengketa.map(s => (
            <div key={s.id} className="card p-4 border-l-4 border-red-500">
              <div className="flex justify-between items-start mb-2">
                <p className="font-semibold">{s.produk_nama} <span className="text-stone-500 font-normal">({s.pesanan_id})</span></p>
                <span className={`badge ${s.status === 'selesai' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{s.status}</span>
              </div>
              <p className="text-sm text-stone-700 mb-2 font-medium">Alasan: {s.alasan}</p>
              {s.status === 'selesai' && (
                <div className="bg-green-50 p-3 rounded-lg text-sm text-green-800 border border-green-200">
                  <strong>Resolusi:</strong> {s.resolusi}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {sengketaForm.open && (
        <div className="fixed inset-0 bg-stone-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="font-display font-semibold text-lg mb-2">Ajukan Komplain / Sengketa</h3>
            <form onSubmit={ajukanSengketa} className="space-y-4">
              <div>
                <label className="label">Alasan Komplain</label>
                <textarea rows="3" required value={sengketaForm.alasan} onChange={(e) => setSengketaForm(f => ({...f, alasan: e.target.value}))} className="input" placeholder="Barang tidak sesuai, timbangan kurang..."></textarea>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setSengketaForm({ open: false })} className="btn-secondary flex-1">Batal</button>
                <button type="submit" className="btn-primary flex-1 !bg-red-600 !border-red-600">Ajukan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
