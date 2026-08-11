'use client';

import { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { regulations, regulatoryBodies, regulationCertificationMappings, certifications } from '@/lib/catalog';
import type { Regulation } from '@/lib/types';

const typeLabels: Record<string, { label: string; bg: string; text: string }> = {
  law: { label: 'نظام', bg: 'bg-red-100', text: 'text-red-700' },
  regulation: { label: 'لائحة', bg: 'bg-orange-100', text: 'text-orange-700' },
  standard: { label: 'ضابط', bg: 'bg-blue-100', text: 'text-blue-700' },
  guideline: { label: 'دليل إرشادي', bg: 'bg-slate-100', text: 'text-slate-600' },
  index: { label: 'مؤشر', bg: 'bg-purple-100', text: 'text-purple-700' },
  framework: { label: 'إطار عمل', bg: 'bg-emerald-100', text: 'text-emerald-700' },
};

const natureLabels: Record<string, string> = {
  mandatory: 'إلزامي',
  recommended: 'موصى به',
  optional: 'اختياري',
};

export default function RegulationsPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all'
    ? regulations
    : regulations.filter(r => r.issuingBodyCode === filter);

  const bodies = regulatoryBodies.filter(b => b.country === 'SA');

  return (
    <AppShell title="المتطلبات التنظيمية">
      <p className="text-sm text-slate-500 mb-4">
        دليل شامل لجميع المتطلبات التنظيمية والأطر والمؤشرات المطبقة على الجهات في المملكة
      </p>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`badge cursor-pointer transition ${filter === 'all' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
        >
          الكل ({regulations.length})
        </button>
        {bodies.map(body => {
          const count = regulations.filter(r => r.issuingBodyCode === body.code).length;
          if (count === 0) return null;
          return (
            <button
              key={body.code}
              onClick={() => setFilter(body.code)}
              className={`badge cursor-pointer transition ${filter === body.code ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {body.nameAr} ({count})
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filtered.map((reg) => (
          <RegulationCard
            key={reg.code}
            regulation={reg}
            expanded={expanded === reg.code}
            onToggle={() => setExpanded(expanded === reg.code ? null : reg.code)}
          />
        ))}
      </div>
    </AppShell>
  );
}

function RegulationCard({ regulation: reg, expanded, onToggle }: {
  regulation: Regulation;
  expanded: boolean;
  onToggle: () => void;
}) {
  const typeConfig = typeLabels[reg.regType] || typeLabels.standard;
  const relatedCerts = regulationCertificationMappings
    .filter(m => m.regulationCode === reg.code)
    .map(m => ({
      ...m,
      cert: certifications.find(c => c.code === m.certificationCode),
    }));

  const totalControls = reg.domains?.reduce((sum, d) => sum + (d.controls?.length || 0), 0) || 0;

  return (
    <div className="card overflow-hidden">
      <button onClick={onToggle} className="w-full p-5 text-right hover:bg-slate-50/50 transition">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`badge ${typeConfig.bg} ${typeConfig.text}`}>{typeConfig.label}</span>
              <span className={`badge ${reg.complianceNature === 'mandatory' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'}`}>
                {natureLabels[reg.complianceNature]}
              </span>
              <span className="text-xs text-slate-400">{reg.issuingBodyCode}</span>
            </div>
            <h3 className="mt-2 text-base font-black">{reg.nameAr}</h3>
            <p className="text-sm text-slate-500">{reg.nameEn}</p>
            {reg.descriptionAr && (
              <p className="mt-1 text-xs text-slate-500 leading-5">{reg.descriptionAr}</p>
            )}
          </div>
          <div className="mr-4 flex items-center gap-3 shrink-0">
            <div className="flex gap-2">
              {reg.certificationAvailable && (
                <span className="badge bg-emerald-100 text-emerald-700 text-[10px]">شهادة متاحة</span>
              )}
              {reg.officialAssessment && (
                <span className="badge bg-blue-100 text-blue-700 text-[10px]">تقييم رسمي</span>
              )}
              {reg.officialAccreditation && (
                <span className="badge bg-purple-100 text-purple-700 text-[10px]">اعتماد رسمي</span>
              )}
            </div>
            <svg className={`h-4 w-4 text-slate-400 transition ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
        {totalControls > 0 && (
          <p className="mt-2 text-xs text-slate-400">{totalControls} ضابط / متطلب</p>
        )}
      </button>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-5 space-y-4">
          {/* Related Certifications */}
          {relatedCerts.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 mb-2">الشهادات ذات الصلة</h4>
              <div className="space-y-2">
                {relatedCerts.map(({ cert, coverage, notes }) => (
                  <div key={cert?.code} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 border border-slate-100">
                    <div className="flex-1">
                      <span className="text-sm font-bold">{cert?.nameAr}</span>
                      <span className="text-xs text-slate-400 mr-2">{cert?.nameEn}</span>
                    </div>
                    <span className={`badge text-[10px] ${
                      coverage === 'direct' ? 'bg-emerald-100 text-emerald-700' :
                      coverage === 'strong' ? 'bg-blue-100 text-blue-700' :
                      coverage === 'partial' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {coverage === 'direct' ? 'تغطية مباشرة' :
                       coverage === 'strong' ? 'تغطية قوية' :
                       coverage === 'partial' ? 'تغطية جزئية' : 'ذو صلة'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Domains and Controls */}
          {reg.domains && reg.domains.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 mb-2">المجالات والضوابط</h4>
              <div className="space-y-2">
                {reg.domains.map((domain) => (
                  <div key={domain.code} className="rounded-xl bg-white border border-slate-100 overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50">
                      <span className="text-xs font-bold text-slate-400">{domain.code}</span>
                      <h5 className="font-bold text-sm">{domain.nameAr}</h5>
                      <span className="text-xs text-slate-500">{domain.nameEn}</span>
                    </div>
                    {domain.controls && domain.controls.length > 0 && (
                      <div className="divide-y divide-slate-50">
                        {domain.controls.map((ctrl) => (
                          <div key={ctrl.code} className="flex items-center justify-between px-4 py-2.5">
                            <div>
                              <span className="text-[10px] text-slate-400 font-mono">{ctrl.code}</span>
                              <span className="text-xs font-bold mr-2">{ctrl.nameAr}</span>
                            </div>
                            <span className={`text-[10px] ${ctrl.complianceNature === 'mandatory' ? 'text-red-500' : 'text-slate-400'}`}>
                              {natureLabels[ctrl.complianceNature]}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
