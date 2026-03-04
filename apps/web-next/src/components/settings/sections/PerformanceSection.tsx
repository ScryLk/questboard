"use client";

import { useSettingsStore } from "@/lib/settings-store";
import {
  SettingsSection,
  SettingsToggle,
  SettingsRadio,
  SettingsSelect,
  SettingsSlider,
} from "../controls";

export function PerformanceSection() {
  const { performance, updatePerformance } = useSettingsStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-white">Performance</h2>
        <p className="mt-1 text-sm text-gray-500">Qualidade gráfica, FPS, renderer e otimizações.</p>
      </div>

      <SettingsSection title="Qualidade Gráfica">
        <SettingsRadio
          label="Qualidade"
          value={performance.quality}
          onChange={(v) => updatePerformance({ quality: v })}
          options={[
            { value: "high", label: "Alta", description: "60fps, todas animações" },
            { value: "medium", label: "Média", description: "30fps, simples" },
            { value: "low", label: "Baixa", description: "Sem animações" },
            { value: "auto", label: "Auto", description: "Detecta hardware" },
          ]}
          columns={4}
        />
      </SettingsSection>

      <SettingsSection title="Fog of War">
        <SettingsRadio
          label="Qualidade do fog"
          value={performance.fogQuality}
          onChange={(v) => updatePerformance({ fogQuality: v })}
          options={[
            { value: "animated", label: "Névoa animada", description: "Mais pesado" },
            { value: "static", label: "Sombras estáticas", description: "Leve" },
            { value: "solid", label: "Preto sólido", description: "Leve" },
          ]}
          columns={3}
        />
        <SettingsSlider label="Limite de partículas" value={performance.particleLimit} min={10} max={100} step={10} onChange={(v) => updatePerformance({ particleLimit: v })} />
      </SettingsSection>

      <SettingsSection title="Canvas">
        <SettingsRadio
          label="Renderer"
          value={performance.renderer}
          onChange={(v) => updatePerformance({ renderer: v })}
          options={[
            { value: "webgl", label: "WebGL", description: "Padrão, mais rápido" },
            { value: "webgpu", label: "WebGPU", description: "Experimental" },
            { value: "canvas2d", label: "Canvas 2D", description: "Fallback" },
          ]}
          columns={3}
        />
        <SettingsToggle label="Viewport culling" description="Não renderizar fora da tela." checked={performance.viewportCulling} onChange={(v) => updatePerformance({ viewportCulling: v })} />
        <SettingsToggle label="Throttle de mousemove" description="Performance do hover." checked={performance.throttleMousemove} onChange={(v) => updatePerformance({ throttleMousemove: v })} />
        <SettingsSelect
          label="FPS target"
          value={performance.fpsTarget}
          onChange={(v) => updatePerformance({ fpsTarget: v })}
          options={[
            { value: 30, label: "30 FPS" },
            { value: 60, label: "60 FPS" },
            { value: 0, label: "Ilimitado" },
          ]}
        />
        <div className="border-t border-white/5 pt-3">
          <SettingsToggle label="Mostrar contador de FPS" description="Debug." checked={performance.showFPS} onChange={(v) => updatePerformance({ showFPS: v })} />
          <SettingsToggle label="Mostrar info de performance" description="Debug." checked={performance.showPerfInfo} onChange={(v) => updatePerformance({ showPerfInfo: v })} />
        </div>
      </SettingsSection>

      <SettingsSection title="Mobile / Economia">
        <SettingsToggle label="Mapa em baixa resolução ao arrastar" checked={performance.lowResWhileDragging} onChange={(v) => updatePerformance({ lowResWhileDragging: v })} />
        <SettingsToggle label="Desativar animações com bateria < 20%" checked={performance.lowBatteryOptimizations} onChange={(v) => updatePerformance({ lowBatteryOptimizations: v })} />
        <SettingsToggle label="Modo economia de bateria" description="Reduz qualidade, desativa animações." checked={performance.batterySaverMode} onChange={(v) => updatePerformance({ batterySaverMode: v })} />
      </SettingsSection>
    </div>
  );
}
