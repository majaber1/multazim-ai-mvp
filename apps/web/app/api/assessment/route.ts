import { NextResponse } from 'next/server';
export async function POST(request: Request){const body=await request.json();const values=Object.values(body.answers??{});const yes=values.filter(Boolean).length;return NextResponse.json({score:values.length?Math.round(yes/values.length*100):0,status:'ok'});}
