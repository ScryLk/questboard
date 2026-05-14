// Backward-compat: `/join/[code]` redireciona pra `/play/[code]`
// (rota real do jogador). Links antigos compartilhados continuam
// funcionando depois que o modal foi corrigido pra emitir `/play`.

import { redirect } from "next/navigation";

interface JoinPageProps {
  params: Promise<{ code: string }>;
}

export default async function JoinByCodePage({ params }: JoinPageProps) {
  const { code } = await params;
  redirect(`/play/${code.toUpperCase()}`);
}
