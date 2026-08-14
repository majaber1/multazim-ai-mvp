'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type Session={user:{id:string;full_name:string;email:string};organization:{id:string;name_ar:string;name_en:string}|null;membership:{role:string}|null};
const SessionContext=createContext<{session:Session|null;loading:boolean;reload:()=>void}>({session:null,loading:true,reload:()=>{}});
export function SessionProvider({children}:{children:React.ReactNode}){const[session,setSession]=useState<Session|null>(null);const[loading,setLoading]=useState(true);const[version,setVersion]=useState(0);useEffect(()=>{const controller=new AbortController();fetch('/api/session',{signal:controller.signal}).then(r=>r.ok?r.json():null).then(setSession).catch(error=>{if(error instanceof DOMException&&error.name==='AbortError')return;setSession(null)}).finally(()=>{if(!controller.signal.aborted)setLoading(false)});return()=>controller.abort()},[version]);return <SessionContext.Provider value={{session,loading,reload:()=>{setLoading(true);setVersion(v=>v+1)}}}>{children}</SessionContext.Provider>}
export function useSession(){return useContext(SessionContext)}
export function useOrganizationId(){const{session,loading}=useSession();return {organizationId:session?.organization?.id??null,loading}}
