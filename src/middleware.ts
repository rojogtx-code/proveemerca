import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas que requieren autenticación
  if (pathname.startsWith('/admin')) {
    const session = request.cookies.get('admin_session');

    if (!session) {
      // Si no hay sesión, redirigir al login
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Configurar en qué rutas se debe ejecutar el middleware
export const config = {
  matcher: ['/admin/:path*'],
};