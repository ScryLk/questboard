"use client";

import { GameplayLayout } from "@/components/gameplay/gameplay-layout";
import { DesktopOnlyNotice } from "@/components/layout/desktop-only-notice";

export default function GameplayPage() {
  return (
    <DesktopOnlyNotice featureName="A mesa virtual (VTT)">
      <GameplayLayout />
    </DesktopOnlyNotice>
  );
}
