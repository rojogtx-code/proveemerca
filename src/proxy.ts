import { NextResponse, NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/session';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas que requieren autenticación
  if (pathname.startsWith('/admin')) {
    const session = request.cookies.get('admin_session');
    const payload = verifySessionToken(session?.value);

    if (!payload) {
      // Si no hay sesión válida, redirigir al login y limpiar cualquier cookie inválida/forjada
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      const response = NextResponse.redirect(url);
      response.cookies.delete('admin_session');
      return response;
    }
  }

  return NextResponse.next();
}

// Configurar en qué rutas se debe ejecutar el proxy
export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
