import { Link } from 'react-router-dom';

const steps = [
  ['Daftar & lengkapi profil', 'Buat akun petani dan lengkapi data lahan Anda.'],
  ['Catat hasil panen', 'Masukkan jenis, jumlah, dan grade kualitas panen Anda.'],
  ['Dapat jejak QR otomatis', 'Setiap produk mendapat kode QR yang bisa ditelusuri pembeli.'],
  ['Terjual dengan harga adil', 'Produk tayang di marketplace dengan harga transparan.'],
];

export default function JadiMitra() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <span className="badge bg-leaf-100 text-leaf-800">Untuk Petani &amp; UMKM Pelosok</span>
      <h1 className="font-display text-3xl sm:text-4xl font-semibold text-stone-900 mt-3">
        Jual hasil panen Anda,<br />tanpa perantara berlapis.
      </h1>
      <p className="text-stone-600 mt-4 leading-relaxed max-w-xl">
        Jejak Tani menghubungkan Anda langsung ke pembeli rumah tangga maupun bisnis (restoran,
        hotel, ritel) di kota. Tidak perlu smartphone canggih &mdash; tim agen lapangan kami siap membantu pendaftaran.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 mt-10">
        {steps.map(([title, desc], i) => (
          <div key={title} className="card p-5">
            <span className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center font-display font-semibold text-sm">{i + 1}</span>
            <p className="font-display font-semibold text-stone-900 mt-3">{title}</p>
            <p className="text-sm text-stone-500 mt-1">{desc}</p>
          </div>
        ))}
      </div>

      <Link to="/daftar" className="btn-primary mt-10 !py-3 !px-7">Daftar Sebagai Petani/UMKM</Link>
    </div>
  );
}
