import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Criar a resposta base
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  // 2. Inicializar Supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // 3. Obter sessão
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // REGRA: Se não está logado e não está no login, vai para /login
  if (!session && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // REGRA: Se está logado e tenta ir para /login, vai para a Home
  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 4. Verificação de Cargo (Proteção extra para a Home e outras rotas)
  if (session && pathname !== "/login" && pathname !== "/pendente") {
    const { data: perfil } = await supabase
      .from("perfis")
      .select("cargo")
      .eq("id", session.user.id)
      .single();

    // Se o cargo não for permitido, manda para uma página de aviso
    if (!perfil || (perfil.cargo !== "admin" && perfil.cargo !== "vendedor")) {
      // Importante: Verifique se app/pendente/page.tsx existe!
      return NextResponse.redirect(new URL("/pendente", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
