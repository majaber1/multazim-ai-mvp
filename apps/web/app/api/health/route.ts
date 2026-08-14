export async function GET(){
  const api=process.env.API_INTERNAL_URL??'http://api:8000';
  try{const response=await fetch(`${api}/health`,{cache:'no-store',signal:AbortSignal.timeout(3000)});if(!response.ok)throw new Error();return Response.json({status:'healthy',api:'ready'})}catch{return Response.json({status:'degraded',api:'unavailable'},{status:503})}
}
