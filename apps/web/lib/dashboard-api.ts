import { authenticatedApi } from './server-api';
import type { ComplianceSnapshot, DashboardData } from './api';

export async function getDashboard():Promise<{data:DashboardData|null;live:boolean}>{
  try{const response=await authenticatedApi('/v1/dashboard');if(!response.ok)return{data:null,live:false};return{data:await response.json() as DashboardData,live:true}}catch{return{data:null,live:false}}
}
export async function getComplianceHistory():Promise<ComplianceSnapshot[]>{
  try{const response=await authenticatedApi('/v1/compliance-history');if(!response.ok)return[];return await response.json() as ComplianceSnapshot[]}catch{return[]}
}
