"use client";

import { useSettingsStore } from "@/lib/settings-store";
import {
  SettingsSection,
  SettingsToggle,
  SettingsRadio,
  SettingsSelect,
  SettingsSlider,
} from "../controls";

export function CombatSection() {
  const { combat, updateCombat, updateCombatOptionalRules } = useSettingsStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-white">Combate e Regras</h2>
        <p className="mt-1 text-sm text-gray-500">Iniciativa, timer, ataques, dano e regras opcionais.</p>
      </div>

      <SettingsSection title="Iniciativa">
        <SettingsRadio
          label="Método de rolagem"
          value={combat.initiativeMethod}
          onChange={(v) => updateCombat({ initiativeMethod: v })}
          options={[
            { value: "auto", label: "Rolar automaticamente", description: "d20 + mod" },
            { value: "manual", label: "GM insere manualmente" },
            { value: "player_roll", label: "Jogadores rolam", description: "GM confirma" },
          ]}
        />
        <SettingsRadio
          label="Desempate"
          value={combat.tieBreaker}
          onChange={(v) => updateCombat({ tieBreaker: v })}
          options={[
            { value: "dex", label: "Maior DES primeiro" },
            { value: "reroll", label: "Re-rolar" },
            { value: "gm", label: "GM decide" },
          ]}
          columns={3}
        />
        <SettingsToggle label="Mostrar próximo turno na fila" checked={combat.showNextTurn} onChange={(v) => updateCombat({ showNextTurn: v })} />
        <SettingsToggle label="Pular criaturas mortas automaticamente" checked={combat.skipDeadCreatures} onChange={(v) => updateCombat({ skipDeadCreatures: v })} />
        <SettingsToggle label="Agrupar inimigos do mesmo tipo" checked={combat.groupEnemies} onChange={(v) => updateCombat({ groupEnemies: v })} />
        <SettingsToggle label="Tocar som ao mudar de turno" checked={combat.turnChangeSound} onChange={(v) => updateCombat({ turnChangeSound: v })} />
      </SettingsSection>

      <SettingsSection title="Timer de Turno">
        <SettingsToggle label="Ativar timer de turno" checked={combat.turnTimer} onChange={(v) => updateCombat({ turnTimer: v })} />
        <SettingsSelect label="Tempo" value={combat.turnTimerDuration} onChange={(v) => updateCombat({ turnTimerDuration: v })} options={[{ value: 30, label: "30s" }, { value: 60, label: "60s" }, { value: 90, label: "90s" }, { value: 120, label: "120s" }, { value: 180, label: "180s" }]} />
        <SettingsRadio
          label="Ao estourar"
          value={combat.turnTimerAction}
          onChange={(v) => updateCombat({ turnTimerAction: v })}
          options={[
            { value: "warn", label: "Aviso visual", description: "Banner vermelho" },
            { value: "skip", label: "Pular turno" },
            { value: "none", label: "Apenas avisar" },
          ]}
          columns={3}
        />
      </SettingsSection>

      <SettingsSection title="Movimento">
        <SettingsSelect label="Unidade" value={combat.measureUnit} onChange={(v) => updateCombat({ measureUnit: v })} options={[{ value: "feet", label: "Feet (ft)" }, { value: "meters", label: "Metros (m)" }, { value: "cells", label: "Células (tiles)" }]} />
        <SettingsToggle label="Badge de movimento restante" description="X/Y ft." checked={combat.showMovementBadge} onChange={(v) => updateCombat({ showMovementBadge: v })} />
        <SettingsToggle label="Highlight células alcançáveis" description="Área verde." checked={combat.showMovementRange} onChange={(v) => updateCombat({ showMovementRange: v })} />
        <SettingsToggle label="Snap ao grid ao mover" checked={combat.snapMovementToGrid} onChange={(v) => updateCombat({ snapMovementToGrid: v })} />
        <SettingsToggle label="Waypoints" description="Shift+Click para caminho não reto." checked={combat.allowWaypoints} onChange={(v) => updateCombat({ allowWaypoints: v })} />
        <SettingsRadio
          label="Terreno difícil"
          value={String(combat.difficultTerrainCost) as "2" | "1.5" | "1"}
          onChange={(v) => updateCombat({ difficultTerrainCost: Number(v) })}
          options={[
            { value: "2", label: "Custo 2x", description: "Regra padrão" },
            { value: "1.5", label: "Custo 1.5x" },
            { value: "1", label: "Ignorar" },
          ]}
          columns={3}
        />
      </SettingsSection>

      <SettingsSection title="Ataques e Dano">
        <SettingsToggle label="Rolar ataque automaticamente" checked={combat.autoRollAttack} onChange={(v) => updateCombat({ autoRollAttack: v })} />
        <SettingsToggle label="Comparar com CA do alvo" checked={combat.autoCompareAC} onChange={(v) => updateCombat({ autoCompareAC: v })} />
        <SettingsToggle label="Rolar dano após acerto" checked={combat.autoRollDamage} onChange={(v) => updateCombat({ autoRollDamage: v })} />
        <SettingsToggle label="Aplicar dano no HP do alvo" checked={combat.autoApplyDamage} onChange={(v) => updateCombat({ autoApplyDamage: v })} />
        <SettingsToggle label="Confirmar antes de aplicar dano" description={'Popup "Aplicar X de dano?"'} checked={combat.confirmDamage} onChange={(v) => updateCombat({ confirmDamage: v })} />
        <SettingsRadio
          label="Críticos"
          value={combat.criticalRule}
          onChange={(v) => updateCombat({ criticalRule: v })}
          options={[
            { value: "double_dice", label: "Dobrar dados", description: "Padrão 5e" },
            { value: "max_plus_roll", label: "Max + rolar" },
            { value: "double_result", label: "Dobrar resultado" },
          ]}
          columns={3}
        />
        <SettingsToggle label="Dano flutuante nos tokens" description="-8, +5." checked={combat.showFloatingDamage} onChange={(v) => updateCombat({ showFloatingDamage: v })} />
        <SettingsSlider label="Duração do dano flutuante" value={combat.floatingDamageDuration} min={0.5} max={3} step={0.5} unit="s" onChange={(v) => updateCombat({ floatingDamageDuration: v })} />
      </SettingsSection>

      <SettingsSection title="Morte e Inconsciente">
        <SettingsToggle label="Testes contra morte automáticos" checked={combat.autoDeathSaves} onChange={(v) => updateCombat({ autoDeathSaves: v })} />
        <SettingsToggle label="Mover token morto pro final da iniciativa" checked={combat.moveDeadToEnd} onChange={(v) => updateCombat({ moveDeadToEnd: v })} />
        <SettingsToggle label="Marcar como morto visualmente" description="Cinza + Skull." checked={combat.markDeadVisually} onChange={(v) => updateCombat({ markDeadVisually: v })} />
      </SettingsSection>

      <SettingsSection title="Reações">
        <SettingsToggle label="Indicador de ataque de oportunidade" description="Ao token sair de alcance." checked={combat.showOppAttackIndicator} onChange={(v) => updateCombat({ showOppAttackIndicator: v })} />
        <SettingsToggle label="Popup de ataque de oportunidade" checked={combat.showOppAttackPopup} onChange={(v) => updateCombat({ showOppAttackPopup: v })} />
      </SettingsSection>

      <SettingsSection title="Concentração">
        <SettingsToggle label="Rastrear concentração de magias" checked={combat.trackConcentration} onChange={(v) => updateCombat({ trackConcentration: v })} />
        <SettingsToggle label="Avisar ao tomar dano" description={'Teste de concentração CD [X].'} checked={combat.concentrationWarning} onChange={(v) => updateCombat({ concentrationWarning: v })} />
        <SettingsToggle label="Remover magia ao perder concentração" checked={combat.autoRemoveConcentration} onChange={(v) => updateCombat({ autoRemoveConcentration: v })} />
      </SettingsSection>

      <SettingsSection title="Regras Opcionais">
        <SettingsToggle label="Flanking" description="Vantagem com 2 aliados em lados opostos." checked={combat.optionalRules.flanking} onChange={(v) => updateCombatOptionalRules({ flanking: v })} />
        <SettingsToggle label="Cleaving" description="Dano excedente vai pro próximo." checked={combat.optionalRules.cleaving} onChange={(v) => updateCombatOptionalRules({ cleaving: v })} />
        <SettingsToggle label="Lingering Injuries" description="Tabela de ferimentos." checked={combat.optionalRules.lingeringInjuries} onChange={(v) => updateCombatOptionalRules({ lingeringInjuries: v })} />
        <SettingsToggle label="Exaustão simplificada (D&D 2024)" checked={combat.optionalRules.simplifiedExhaustion} onChange={(v) => updateCombatOptionalRules({ simplifiedExhaustion: v })} />
        <SettingsToggle label="Poção como ação bônus" checked={combat.optionalRules.potionBonusAction} onChange={(v) => updateCombatOptionalRules({ potionBonusAction: v })} />
        <SettingsToggle label="Descanso curto: 10 minutos" description="Em vez de 1 hora." checked={combat.optionalRules.shortRest10min} onChange={(v) => updateCombatOptionalRules({ shortRest10min: v })} />
      </SettingsSection>
    </div>
  );
}
