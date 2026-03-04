"use client";

import { useSettingsStore } from "@/lib/settings-store";
import {
  SettingsSection,
  SettingsToggle,
  SettingsRadio,
  SettingsSelect,
  SettingsSlider,
} from "../controls";

export function PlayerViewSection() {
  const { playerView, updatePlayerView } = useSettingsStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-white">Visão dos Jogadores</h2>
        <p className="mt-1 text-sm text-gray-500">Fog of War, informações de inimigos e permissões dos jogadores.</p>
      </div>

      <SettingsSection title="Fog of War">
        <SettingsRadio
          label="Modo"
          value={playerView.fogMode}
          onChange={(v) => updatePlayerView({ fogMode: v })}
          options={[
            { value: "manual", label: "Manual", description: "GM pinta/revela" },
            { value: "dynamic", label: "Dinâmico", description: "Baseado na visão" },
            { value: "hybrid", label: "Híbrido", description: "Manual + visão" },
            { value: "disabled", label: "Desativado" },
          ]}
          columns={2}
        />
        <SettingsRadio
          label="Estilo visual"
          value={playerView.fogStyle}
          onChange={(v) => updatePlayerView({ fogStyle: v })}
          options={[
            { value: "mist", label: "Névoa animada", description: "Com partículas" },
            { value: "shadow", label: "Sombra sólida", description: "Com borda suave" },
            { value: "solid", label: "Sombra simples", description: "Sem efeitos" },
          ]}
          columns={3}
        />
        <SettingsSelect
          label="Cor da névoa"
          value={playerView.fogColor}
          onChange={(v) => updatePlayerView({ fogColor: v })}
          options={[
            { value: "gray", label: "Cinza" },
            { value: "blue", label: "Azul" },
            { value: "red", label: "Vermelho" },
            { value: "green", label: "Verde" },
          ]}
        />
        <SettingsSlider label="Opacidade" value={playerView.fogOpacity} min={20} max={100} step={5} unit="%" onChange={(v) => updatePlayerView({ fogOpacity: v })} />
        <SettingsToggle label="Bordas suaves (blur)" checked={playerView.softEdges} onChange={(v) => updatePlayerView({ softEdges: v })} />
        <SettingsToggle label="Animação da névoa" checked={playerView.fogAnimation} onChange={(v) => updatePlayerView({ fogAnimation: v })} />
      </SettingsSection>

      <SettingsSection title="Áreas Exploradas">
        <SettingsToggle label="Lembrar áreas exploradas" checked={playerView.showExplored} onChange={(v) => updatePlayerView({ showExplored: v })} />
        <SettingsToggle label="Mostrar tokens em áreas exploradas" description="Arriscado." checked={playerView.showTokensInExplored} onChange={(v) => updatePlayerView({ showTokensInExplored: v })} />
        <SettingsSlider label="Opacidade do explored" value={playerView.exploredOpacity} min={10} max={80} step={5} unit="%" onChange={(v) => updatePlayerView({ exploredOpacity: v })} />
      </SettingsSection>

      <SettingsSection title="Informações de Inimigos">
        <SettingsRadio
          label="Nome"
          value={playerView.enemyNameDisplay}
          onChange={(v) => updatePlayerView({ enemyNameDisplay: v })}
          options={[
            { value: "real", label: "Nome real", description: '"Goblin"' },
            { value: "generic", label: "Genérico", description: '"Criatura"' },
            { value: "type", label: "Tipo", description: '"Humanoide Pequeno"' },
          ]}
          columns={3}
        />
        <SettingsToggle label="Revelar nome após primeiro ataque" checked={playerView.revealNameAfterAttack} onChange={(v) => updatePlayerView({ revealNameAfterAttack: v })} />
        <SettingsRadio
          label="HP"
          value={playerView.enemyHPDisplay}
          onChange={(v) => updatePlayerView({ enemyHPDisplay: v })}
          options={[
            { value: "description", label: "Descrição vaga", description: '"Ferido"' },
            { value: "bar", label: "Barra sem números" },
            { value: "numeric", label: "HP numérico" },
            { value: "hidden", label: "Escondido" },
          ]}
          columns={2}
        />
        <SettingsToggle label="Mostrar condições dos inimigos" checked={playerView.showEnemyConditions} onChange={(v) => updatePlayerView({ showEnemyConditions: v })} />
        <SettingsToggle label="Mostrar CA dos inimigos" checked={playerView.showEnemyAC} onChange={(v) => updatePlayerView({ showEnemyAC: v })} />
      </SettingsSection>

      <SettingsSection title="Informações de Aliados">
        <SettingsToggle label="HP numérico dos aliados" checked={playerView.showAllyHP} onChange={(v) => updatePlayerView({ showAllyHP: v })} />
        <SettingsToggle label="Condições dos aliados" checked={playerView.showAllyConditions} onChange={(v) => updatePlayerView({ showAllyConditions: v })} />
        <SettingsToggle label="Ficha completa dos aliados" description="Permitir ver stats uns dos outros." checked={playerView.showAllySheets} onChange={(v) => updatePlayerView({ showAllySheets: v })} />
      </SettingsSection>

      <SettingsSection title="Movimento dos Jogadores">
        <SettingsToggle label="Mover token fora de combate" checked={playerView.playerMoveOutOfCombat} onChange={(v) => updatePlayerView({ playerMoveOutOfCombat: v })} />
        <SettingsToggle label="Mover token no seu turno" checked={playerView.playerMoveOnTurn} onChange={(v) => updatePlayerView({ playerMoveOnTurn: v })} />
        <SettingsToggle label="Mover token fora do turno" checked={playerView.playerMoveOffTurn} onChange={(v) => updatePlayerView({ playerMoveOffTurn: v })} />
        <SettingsToggle label="Mostrar área de movimento" checked={playerView.showPlayerMovementRange} onChange={(v) => updatePlayerView({ showPlayerMovementRange: v })} />
        <SettingsToggle label="Limitar ao máximo de ft" checked={playerView.limitPlayerMovement} onChange={(v) => updatePlayerView({ limitPlayerMovement: v })} />
      </SettingsSection>

      <SettingsSection title="Ferramentas dos Jogadores">
        <SettingsToggle label="Zoom/Pan" checked={playerView.playerCanZoom} onChange={(v) => updatePlayerView({ playerCanZoom: v })} />
        <SettingsToggle label="Régua (medir distâncias)" checked={playerView.playerCanRuler} onChange={(v) => updatePlayerView({ playerCanRuler: v })} />
        <SettingsToggle label="Ver coordenadas do grid" checked={playerView.playerCanSeeCoordinates} onChange={(v) => updatePlayerView({ playerCanSeeCoordinates: v })} />
        <SettingsToggle label="Ping no mapa" checked={playerView.playerCanPing} onChange={(v) => updatePlayerView({ playerCanPing: v })} />
      </SettingsSection>

      <SettingsSection title="Câmera dos Jogadores">
        <SettingsToggle label="Centralizar no token do turno atual" checked={playerView.autoCenterOnTurn} onChange={(v) => updatePlayerView({ autoCenterOnTurn: v })} />
        <SettingsToggle label="Centralizar no próprio token ao conectar" checked={playerView.autoCenterOnConnect} onChange={(v) => updatePlayerView({ autoCenterOnConnect: v })} />
        <SettingsToggle label="Forçar câmera" description="GM controla o que jogador vê." checked={playerView.forcedCamera} onChange={(v) => updatePlayerView({ forcedCamera: v })} />
      </SettingsSection>
    </div>
  );
}
