export function MetricCard({label,value,detail,tone='emerald'}:{label:string;value:string;detail:string;tone?:'emerald'|'red'|'amber'|'slate'}) {
  const colors={emerald:'text-emerald-700 bg-emerald-50',red:'text-red-700 bg-red-50',amber:'text-amber-700 bg-amber-50',slate:'text-slate-700 bg-slate-100'};
  return <article className="card p-5"><div className={`inline-flex rounded-xl px-3 py-1 text-xs font-bold ${colors[tone]}`}>{label}</div><div className="mt-4 text-3xl font-black tracking-tight">{value}</div><p className="mt-2 text-sm text-slate-500">{detail}</p></article>;
}
