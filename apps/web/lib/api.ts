import { actions, frameworks } from './demo-data';

export const DEMO_ORGANIZATION_ID='11111111-1111-4111-8111-111111111111';
export const demoHeaders={
  'Content-Type':'application/json',
  'X-User-Id':'demo-admin',
  'X-Organization-Id':DEMO_ORGANIZATION_ID,
  'X-Role':'organization_admin',
};
export type ActionItem={id:string;organization_id:string;title:string;owner:string;due_date:string;priority:'critical'|'high'|'medium'|'low';impacted_frameworks:string[];status:string};
export type DashboardData={organization_id:string;overall_score:number;evidence_readiness:number;critical_gaps:number;applicable_frameworks:number;trend:number;framework_scores:{code:string;name_ar:string;name_en:string;score:number;version:string}[];actions:ActionItem[];risk_distribution:Record<string,number>;disclaimer_ar:string};

export const fallbackDashboard:DashboardData={
  organization_id:DEMO_ORGANIZATION_ID,overall_score:76,evidence_readiness:68,critical_gaps:1,applicable_frameworks:4,trend:4.2,
  framework_scores:frameworks.map(f=>({code:f.code,name_ar:f.nameAr,name_en:f.nameEn,score:f.score,version:f.code.includes('2025')?'2025':f.code.includes('2024')?'2-2024':f.code.includes('27001')?'2022':'current'})),
  actions:actions.map((a,index)=>({id:`fallback-${index}`,organization_id:DEMO_ORGANIZATION_ID,title:a.title,owner:a.owner,due_date:`2026-08-${index===0?'12':index===1?'17':'25'}`,priority:index===0?'critical':index===1?'high':'medium',impacted_frameworks:Array(a.impact).fill('Framework'),status:index===0?'open':index===1?'in_progress':'planned'})),
  risk_distribution:{critical:3,high:8,medium:14},disclaimer_ar:'بيانات تجريبية ودرجات ملتزم تقديرية وليست تقييمًا رسميًا صادرًا من جهة تنظيمية.',
};

export function browserApiUrl(){return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'}

export async function getDashboard():Promise<{data:DashboardData;live:boolean}>{
  try{
    const base=process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
    const response=await fetch(`${base}/v1/dashboard`,{headers:demoHeaders,cache:'no-store'});
    if(!response.ok) throw new Error(`Dashboard API ${response.status}`);
    return {data:await response.json() as DashboardData,live:true};
  }catch{return {data:fallbackDashboard,live:false}}
}
