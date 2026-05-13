// ── Clerk auth middleware ──
//
// Protege rotas do painel do mestre (`/dashboard`, `/gameplay`,
// `/admin`, e demais segmentos do route group (dashboard) — Next
// remove os parênteses na URL final, então as paths reais batem com
// `/maps`, `/characters`, `/notes`, etc).
//
// Rotas públicas (não exigem login):
//   - `/`                landing
//   - `/login`           tela de auth (Clerk renderiza <SignIn />)
//   - `/legal/*`         atribuição CC-BY, ToS, etc
//   - `/join/*`          link de invite (a página redireciona pro login se preciso)
//   - `/play/*`          player view (jogador entra com code, sem cadastro)
//   - `/api/*`           handlers Next (não os do backend Fastify)
//   - estáticos          favicon, manifest, etc

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/sign-up(.*)",
  "/legal(.*)",
  "/join(.*)",
  "/play(.*)",
  "/api(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) return;
  // Protege todas as outras rotas. Quando não autenticado, Clerk
  // redireciona pra `signInUrl` configurada no ClerkProvider (`/login`).
  await auth.protect();
});

export const config = {
  matcher: [
    // Tudo exceto Next internals + estáticos de imagem.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Sempre rodar pra rotas de API
    "/(api|trpc)(.*)",
  ],
};
