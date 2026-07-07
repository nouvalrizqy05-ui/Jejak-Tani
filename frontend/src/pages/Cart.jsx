import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';
import { formatRupiah } from '../utils.js';

export default function Cart() {
  const { items, updateQty, removeItem, total, clear } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();
  const [tipe, setTipe] = useState('same_day');
  const [alamat, setAlamat] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    if (!alamat.trim()) { setError('Alamat pengiriman wajib diisi.'); return; }
    setLoading(true);
    setError('');
    try {
      const created = [];
      for (const item of items) {
        const pesanan = await api.createPesanan({
          produk_id: item.produk.id,
          jumlah_kg: item.jumlah_kg,
          tipe_pengiriman: tipe,
          catatan_alamat: alamat,
        }, token);
        created.push(pesanan.id);
      }
      
      const snapRes = await api.createPayment({ pesanan_ids: created }, token);
      
      window.snap.pay(snapRes.token, {
        onSuccess: function(result) {
          clear();
          navigate('/akun/pesanan', { state: { justOrdered: created, paymentStatus: 'success' } });
        },
        onPending: function(result) {
          clear();
          navigate('/akun/pesanan', { state: { justOrdered: created, paymentStatus: 'pending' } });
        },
        onError: function(result) {
          navigate('/akun/pesanan');
        },
        onClose: function() {
          navigate('/akun/pesanan');
        }
      });
      
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <p className="text-5xl mb-4">🧺</p>
        <h1 className="font-display text-2xl font-semibold text-stone-900">Keranjang masih kosong</h1>
        <p className="text-stone-500 mt-2">Yuk jelajahi produk segar langsung dari petani.</p>
        <Link to="/" className="btn-primary mt-6 inline-flex">Ke Marketplace</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-display text-2xl font-semibold text-stone-900 mb-6">Keranjang Belanja</h1>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.produk.id} className="card p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-teal-50 flex items-center justify-center text-3xl">{item.produk.foto_emoji}</div>
            <div className="flex-1">
              <p className="font-display font-semibold text-stone-900">{item.produk.nama}</p>
              <p className="text-sm text-stone-500">{formatRupiah(item.produk.harga_per_kg)} / kg</p>
            </div>
            <input
              type="number" min="1" value={item.jumlah_kg}
              onChange={(e) => updateQty(item.produk.id, Math.max(1, Number(e.target.value)))}
              className="input !w-20 text-center"
            />
            <span className="w-28 text-right font-semibold text-stone-800">{formatRupiah(item.jumlah_kg * item.produk.harga_per_kg)}</span>
            <button onClick={() => removeItem(item.produk.id)} className="text-stone-400 hover:text-red-500 text-sm">Hapus</button>
          </div>
        ))}
      </div>

      <div className="card p-5 mt-6 space-y-4">
        <div>
          <label className="label">Alamat pengiriman</label>
          <textarea value={alamat} onChange={(e) => setAlamat(e.target.value)} rows={2} className="input" placeholder="Nama jalan, kota, kode pos" />
        </div>
        <div>
          <label className="label">Opsi pengiriman</label>
          <div className="flex gap-2">
            {[
              ['same_day', 'Same-day (sebelum 11.00)'],
              ['reguler', 'Reguler'],
              ['tanpa_kontak', 'Tanpa kontak'],
            ].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setTipe(val)}
                className={`btn-secondary !rounded-xl text-xs !py-2 ${tipe === val ? '!bg-teal-700 !text-white !border-teal-700' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
          <span className="text-stone-500">Total</span>
          <span className="font-display text-2xl font-semibold text-teal-800">{formatRupiah(total)}</span>
        </div>
        <button onClick={handleCheckout} disabled={loading} className="btn-primary w-full !py-3">
          {loading ? 'Memproses...' : 'Bayar & Buat Pesanan'}
        </button>
        <p className="text-xs text-stone-400 text-center">
          Menggunakan Midtrans Sandbox Payment Gateway &mdash; Aman dan terintegrasi untuk WebDev Competition.
        </p>
      </div>
    </div>
  );
}
