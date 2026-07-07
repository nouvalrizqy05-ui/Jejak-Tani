import { formatDateTime, STAGE_LABELS } from '../utils.js';

const STAGE_ICONS = {
  panen: '\u{1F33E}',
  grading: '\u{1F50D}',
  gudang: '\u{1F3E2}',
  dipasarkan: '\u{1F6D2}',
  habis: '\u2705',
};

export default function TraceTimeline({ perjalanan = [] }) {
  return (
    <ol className="relative border-l-2 border-teal-200 ml-4">
      {perjalanan.map((step, idx) => (
        <li key={idx} className="mb-8 ml-6 last:mb-0">
          <span className="absolute -left-[19px] flex items-center justify-center w-9 h-9 rounded-full bg-teal-700 text-white text-base shadow-sm ring-4 ring-white">
            {STAGE_ICONS[step.tahap] || '\u2022'}
          </span>
          <div className="card p-4">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <h4 className="font-display font-semibold text-stone-900">
                {STAGE_LABELS[step.tahap] || step.tahap}
              </h4>
              <time className="text-xs text-stone-400">{formatDateTime(step.waktu)}</time>
            </div>
            {step.lokasi && <p className="text-sm text-stone-500 mt-0.5">{step.lokasi}</p>}
            {step.catatan && <p className="text-sm text-stone-600 mt-1">{step.catatan}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
