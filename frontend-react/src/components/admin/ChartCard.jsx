import React from 'react';

export default function ChartCard({ title, data, keyX, keyY, color }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d[keyY]), 1);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
      <h3 className="font-bold text-slate-700 dark:text-white mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map(item => (
          <div key={item[keyX]} className="flex items-center gap-3">
            <span className="text-xs text-slate-500 w-20 truncate font-medium capitalize">{item[keyX]}</span>
            <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${(item[keyY] / max) * 100}%`, background: color }}
              />
            </div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 w-6 text-right">{item[keyY]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
