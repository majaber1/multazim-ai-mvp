'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { StatusChip } from '@/components/StatusChip';
import { ActionItem, browserApiUrl, demoHeaders } from '@/lib/api';

const priorityAr: Record<string, string> = { critical: 'حرجة', high: 'عالية', medium: 'متوسطة', low: 'منخفضة' };
const statusAr: Record<string, string> = { open: 'مفتوح', in_progress: 'قيد المعالجة', planned: 'مخطط', completed: 'مكتمل' };

export default function Gaps() {
  const [items, setItems] = useState<ActionItem[]>([]);
  const [live, setLive] = useState(false);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${browserApiUrl()}/v1/actions`, { headers: demoHeaders, signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error();
        return response.json() as Promise<ActionItem[]>;
      })
      .then(data => { setItems(data); setLive(true); })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  async function complete(item: ActionItem) {
    setUpdating(item.id);
    try {
      const response = await fetch(`${browserApiUrl()}/v1/actions/${item.id}`, {
        method: 'PATCH', headers: demoHeaders, body: JSON.stringify({ status: 'completed' }),
      });
      if (!response.ok) throw new Error();
      const updated = await response.json() as ActionItem;
      setItems(current => current.map(action => action.id === updated.id ? updated : action));
    } finally { setUpdating(null); }
  }

  const open = items.filter(item => item.status !== 'completed');
  const critical = open.filter(item => item.priority === 'critical').length;
  const completed = items.filter(item => item.status === 'completed').length;

  return <AppShell title="الفجوات وخطط المعالجة">
    <div className="mb-4 flex justify-end"><StatusChip tone={live ? 'emerald' : 'amber'}>{live ? 'متصل بالـ API' : 'جارٍ تحميل بيانات المؤسسة'}</StatusChip></div>
    <div className="grid gap-4 md:grid-cols-4">
      <div className="card p-5"><b className="text-3xl">{items.length}</b><p className="text-sm text-slate-500">إجمالي الإجراءات</p></div>
      <div className="card p-5"><b className="text-3xl text-red-700">{critical}</b><p className="text-sm text-slate-500">حرجة مفتوحة</p></div>
      <div className="card p-5"><b className="text-3xl text-amber-700">{open.length}</b><p className="text-sm text-slate-500">قيد المعالجة</p></div>
      <div className="card p-5"><b className="text-3xl text-emerald-700">{items.length ? Math.round(completed / items.length * 100) : 0}%</b><p className="text-sm text-slate-500">تقدم الإغلاق</p></div>
    </div>
    <div className="card mt-5 overflow-x-auto"><table className="w-full min-w-[820px] text-right text-sm">
      <thead className="bg-slate-50 text-slate-500"><tr>{['الإجراء','المالك','المخاطرة','الأطر المتأثرة','الحالة',''].map((label,index)=><th className="px-5 py-3" key={`${label}-${index}`}>{label}</th>)}</tr></thead>
      <tbody className="divide-y">{items.map(action=><tr key={action.id}>
        <td className="px-5 py-4 font-bold">{action.title}<div className="text-xs font-normal text-slate-400" dir="ltr">{action.due_date}</div></td>
        <td className="px-5 py-4">{action.owner}</td>
        <td className="px-5 py-4"><StatusChip tone={action.priority === 'critical' ? 'red' : 'amber'}>{priorityAr[action.priority]}</StatusChip></td>
        <td className="px-5 py-4">{action.impacted_frameworks.length}</td><td className="px-5 py-4">{statusAr[action.status] ?? action.status}</td>
        <td className="px-5 py-4">{action.status !== 'completed' && live ? <button disabled={updating === action.id} onClick={() => complete(action)} className="rounded-lg border border-emerald-700 px-3 py-2 text-xs font-black text-emerald-700 disabled:opacity-50">{updating === action.id ? 'جارٍ...' : 'إغلاق'}</button> : null}</td>
      </tr>)}</tbody>
    </table>{live && items.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">لا توجد إجراءات معالجة لهذه المؤسسة بعد.</p> : null}</div>
  </AppShell>;
}
