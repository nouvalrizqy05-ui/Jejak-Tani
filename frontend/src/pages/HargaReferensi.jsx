import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { formatRupiah, formatDate } from '../utils.js';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function HargaReferensi() {
  const [harga, setHarga] = useState([]);
  const [historis, setHistoris] = useState([]);
  const [selectedKomoditas, setSelectedKomoditas] = useState(null);

  useEffect(() => { 
    api.listHarga().then(data => {
      setHarga(data);
      if (data.length > 0) setSelectedKomoditas(data[0].komoditas);
    }); 
  }, []);

  useEffect(() => {
    if (selectedKomoditas) {
      api.getHargaHistoris(selectedKomoditas).then(setHistoris);
    }
  }, [selectedKomoditas]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <span className="badge bg-teal-100 text-teal-800">Transparansi Harga</span>
      <h1 className="font-display text-3xl font-semibold text-stone-900 mt-3">Harga Referensi Pasar</h1>
      <p className="text-stone-600 mt-3 leading-relaxed max-w-xl">
        Lihat harga acuan sebelum Anda menjual atau membeli. Data ini membantu memastikan tidak
        ada pihak yang membentuk harga secara sepihak &mdash; inti dari melawan rantai tengkulak berlapis.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="space-y-2 md:col-span-1">
          <h2 className="font-semibold text-stone-900 mb-3">Komoditas</h2>
          {harga.map((h) => (
            <div 
              key={h.komoditas} 
              onClick={() => setSelectedKomoditas(h.komoditas)}
              className={`card p-4 cursor-pointer transition ${selectedKomoditas === h.komoditas ? 'border-teal-600 bg-teal-50' : 'hover:border-stone-300'}`}
            >
              <p className="font-display font-semibold text-stone-900">{h.komoditas}</p>
              <div className="mt-1 flex justify-between items-end">
                <span className="font-display text-lg font-semibold text-teal-800">{formatRupiah(h.harga_per_kg)}</span>
                <span className="text-xs text-stone-500">Harga Hari Ini</span>
              </div>
            </div>
          ))}
        </div>

        <div className="md:col-span-2">
          {selectedKomoditas && historis.length > 0 && (
            <div className="card p-6 h-full min-h-[400px] flex flex-col">
              <h2 className="font-semibold text-stone-900 mb-1">Tren Harga 30 Hari: {selectedKomoditas}</h2>
              <p className="text-xs text-stone-500 mb-6">Sumber: {historis[0]?.sumber}</p>
              
              <div className="flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historis} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" vertical={false} />
                    <XAxis 
                      dataKey="tanggal" 
                      tickFormatter={(val) => formatDate(val).slice(0, 6)}
                      tick={{fontSize: 12, fill: '#78716c'}}
                      axisLine={false}
                      tickLine={false}
                      dy={10}
                    />
                    <YAxis 
                      tickFormatter={(val) => `Rp${val/1000}k`}
                      tick={{fontSize: 12, fill: '#78716c'}}
                      axisLine={false}
                      tickLine={false}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip 
                      formatter={(value) => [formatRupiah(value), 'Harga']}
                      labelFormatter={(label) => formatDate(label)}
                      contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="harga_per_kg" 
                      stroke="#0f766e" 
                      strokeWidth={3} 
                      dot={{ r: 2, fill: '#0f766e', strokeWidth: 0 }} 
                      activeDot={{ r: 6, fill: '#0f766e', stroke: '#ccfbf1', strokeWidth: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card p-5 mt-8 bg-stone-50 text-sm text-stone-500">
        Catatan: data pada demo ini bersifat simulasi. Untuk versi produksi, sumber data perlu
        diintegrasikan dengan Panel Harga Pangan Nasional (Badan Pangan Nasional) atau PIHPS Bank Indonesia &mdash;
        lihat berkas <code className="px-1 py-0.5 bg-white rounded border border-stone-200">PRODUCTION_CHECKLIST.md</code>.
      </div>
    </div>
  );
}
