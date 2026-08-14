export function StatusChip({children,tone='slate'}:{children:React.ReactNode;tone?:'emerald'|'red'|'amber'|'slate'|'blue'}) {
  const colors={emerald:'bg-emerald-50 text-emerald-700',red:'bg-red-50 text-red-700',amber:'bg-amber-50 text-amber-700',slate:'bg-slate-100 text-slate-600',blue:'bg-blue-50 text-blue-700'};
  return <span className={`badge ${colors[tone]}`}>{children}</span>;
}
