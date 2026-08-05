import { NextResponse, type NextRequest } from "next/server";

const entetesCors: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function proxy(requete: NextRequest) {
  if (requete.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: entetesCors });
  }
  const reponse = NextResponse.next();
  Object.entries(entetesCors).forEach(([cle, valeur]) =>
    reponse.headers.set(cle, valeur)
  );
  return reponse;
}

export const config = {
  matcher: "/api/:path*",
};
