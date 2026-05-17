import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '12345678';

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  
  if (password === ADMIN_PASSWORD) {
    return NextResponse.json({ success: true, token: 'admin-session' });
  }
  
  return NextResponse.json({ error: 'Mot de passe invalide' }, { status: 401 });
}