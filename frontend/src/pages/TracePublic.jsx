import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
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

  // Extract temperature data for the chart
  const tempData = data?.perjalanan?.filter(p => p.suhu_celcius !== null).map(p => ({
    tahap: p.tahap,
    suhu: p.suhu_celcius
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
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

            {/* IoT & GPS Dashboard Section */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              
              {/* GPS Radar Module */}
              <div className="card p-5 border-t-4 border-t-teal-600">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-stone-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Posisi GPS Armada
                  </h3>
                  <span className="flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> LIVE
                  </span>
                </div>
                <div className="relative h-48 bg-stone-100 rounded-lg overflow-hidden border border-stone-200">
                  {/* SVG map background simulation */}
                  <svg className="absolute inset-0 w-full h-full text-stone-200" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path fill="currentColor" d="M10,20 Q30,10 50,30 T90,20 L100,0 L0,0 Z M0,40 Q20,60 40,40 T100,50 L100,100 L0,100 Z" opacity="0.5"/>
                    <path stroke="currentColor" strokeWidth="0.5" fill="none" d="M10,10 L90,90 M10,90 L90,10" opacity="0.3"/>
                  </svg>
                  {/* Radar ping animation */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      <div className="w-4 h-4 bg-teal-600 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"></div>
                      <div className="w-12 h-12 bg-teal-400 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping opacity-75"></div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-stone-500 mt-3 text-center">
                  Koordinat: {data.perjalanan.length > 0 ? (data.perjalanan[data.perjalanan.length - 1].lokasi || 'Dalam perjalanan') : 'Menunggu pembaruan'}
                </p>
              </div>

              {/* Temperature Cold-Chain Chart */}
              <div className="card p-5 border-t-4 border-t-cyan-500">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display font-semibold text-stone-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                    </svg>
                    Suhu Cold Chain IoT
                  </h3>
                </div>
                
                {tempData.length > 0 ? (
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={tempData} margin={{ top: 5, right: 10, bottom: 0, left: -25 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="tahap" tick={{fontSize: 10}} />
                        <YAxis tick={{fontSize: 10}} domain={['dataMin - 2', 'dataMax + 2']} />
                        <Tooltip />
                        <Line type="monotone" dataKey="suhu" stroke="#06b6d4" strokeWidth={2} activeDot={{r: 6}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center bg-stone-50 rounded-lg border border-stone-200 border-dashed">
                    <p className="text-sm text-stone-400">Data sensor belum tersedia</p>
                  </div>
                )}
                <p className="text-xs text-stone-500 mt-3 text-center">
                  Pemantauan suhu kontainer logistik untuk menjaga kesegaran.
                </p>
              </div>

            </div>

            <div className="mt-10">
              <h2 className="font-display text-xl font-semibold text-stone-900 mb-6 text-center">Perjalanan Produk Ini</h2>
              <div className="max-w-lg mx-auto">
                <TraceTimeline perjalanan={data.perjalanan} />
              </div>
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
