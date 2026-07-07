import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api.js';
import { formatDate } from '../utils.js';
import TrustStars from '../components/TrustStars.jsx';
import TraceTimeline from '../components/TraceTimeline.jsx';
import Logo from '../components/Logo.jsx';

export default function TracePublic() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [sertifikasi, setSertifikasi] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const trace = await api.getTrace(id);
        setData(trace);
        const cert = await api.getSertifikasiProduk(id);
        setSertifikasi(cert);
      } catch (e) {
        setError(e.message);
      }
    }
    load();
  }, [id]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex justify-center mb-8"><Logo size={40} /></div>

        {error && <p className="text-center text-stone-500">{error}</p>}

        {data && (
          <>
            <div className="card p-6 text-center">
              <div className="flex gap-2 justify-center text-sm text-stone-500 mb-6">
                <span className="bg-stone-100 px-3 py-1 rounded-full uppercase tracking-wider text-xs font-bold text-stone-700">
                  Grade {data.produk.grade}
                </span>
                {sertifikasi.map(cert => (
                  <span key={cert.id} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    🏆 {cert.jenis}
                  </span>
                ))}
              </div>
              <div className="text-6xl mb-3">{data.produk.foto_emoji}</div>
              <h1 className="font-display text-2xl font-semibold text-stone-900">{data.produk.nama}</h1>
              <p className="text-stone-500 text-sm mt-1">Dipanen {formatDate(data.produk.tanggal_panen)}</p>
              {data.petani && (
                <div className="mt-4 pt-4 border-t border-stone-100">
                  <p className="text-sm text-stone-500">Diproduksi oleh</p>
                  <p className="font-display font-semibold text-stone-900">{data.petani.nama}</p>
                  <p className="text-sm text-stone-500">{data.petani.desa}</p>
                  <div className="mt-2 flex justify-center">
                    <TrustStars rataRata={data.petani.trust?.rata_rata} jumlah={data.petani.trust?.jumlah_ulasan} />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-10">
              <h2 className="font-display text-xl font-semibold text-stone-900 mb-6 text-center">Perjalanan Produk Ini</h2>
              <TraceTimeline perjalanan={data.perjalanan} />
            </div>

            <p className="text-center text-xs text-stone-400 mt-10">
              Halaman ini dibuka melalui pemindaian QR code Jejak Tani &mdash; jejak digital yang menjamin
              transparansi dari ladang hingga ke tangan Anda.
            </p>
            <div className="text-center mt-4">
              <Link to="/" className="text-sm text-teal-700 hover:underline">Kunjungi marketplace Jejak Tani &rarr;</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
