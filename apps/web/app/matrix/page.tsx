import { AppShell } from '@/components/AppShell';
import { universalControls } from '@/lib/demo-data';

const columns = ['NCA ECC', 'DGA', 'PDPL', 'ISO 27001', 'SAMA'];

export default function Matrix() {
  return <AppShell title="مصفوفة الامتثال">
    <div className="card w-full max-w-full overflow-x-auto" dir="ltr">
      <table className="w-full min-w-[800px] text-center text-sm" dir="rtl">
        <thead className="bg-slate-950 text-white"><tr><th className="px-5 py-4 text-right">الضابط الموحد</th>{columns.map(column => <th key={column} className="px-4 py-4">{column}</th>)}</tr></thead>
        <tbody className="divide-y">{universalControls.map(control => <tr key={control.code}><td className="px-5 py-5 text-right"><b>{control.code}</b><div className="text-xs text-slate-500">{control.name}</div></td>{columns.map(column => <td key={column} className="px-4 py-5"><span className={`inline-block h-3 w-3 rounded-full ${control.frameworks.some(framework => framework.includes(column.split(' ')[0])) ? 'bg-emerald-500' : 'bg-slate-200'}`}><span className="sr-only">{column}</span></span></td>)}</tr>)}</tbody>
      </table>
    </div>
    <p className="mt-4 text-xs text-slate-500">المطابقة المعروضة تجريبية وغير معتمدة. المطابقات المقترحة بالذكاء الاصطناعي تتطلب موافقة بشرية.</p>
  </AppShell>;
}
