"use client";

import { useSettingsStore } from "@/lib/settings-store";
import { SettingsSection, SettingsToggle, SettingsSlider } from "../controls";

export function AudioSection() {
  const { audio, updateAudio } = useSettingsStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-white">Áudio e Trilha Sonora</h2>
        <p className="mt-1 text-sm text-gray-500">Volumes, trilha sonora, sons do sistema e controles pessoais.</p>
      </div>

      <SettingsSection title="Trilha Sonora (GM)">
        <SettingsSlider label="Volume master" value={audio.masterVolume} min={0} max={100} step={5} unit="%" onChange={(v) => updateAudio({ masterVolume: v })} />
        <SettingsToggle label="Ativar trilha sonora" checked={audio.enableSoundtrack} onChange={(v) => updateAudio({ enableSoundtrack: v })} />
        <SettingsToggle label="Sincronizar áudio com jogadores" checked={audio.syncSoundtrack} onChange={(v) => updateAudio({ syncSoundtrack: v })} />
        <SettingsToggle label="Mostrar nome da música pro jogador" checked={audio.showTrackName} onChange={(v) => updateAudio({ showTrackName: v })} />
        <SettingsToggle label="Loop automático" checked={audio.loopMusic} onChange={(v) => updateAudio({ loopMusic: v })} />
        <SettingsToggle label="Crossfade entre músicas (2s)" checked={audio.crossfade} onChange={(v) => updateAudio({ crossfade: v })} />
      </SettingsSection>

      <SettingsSection title="Sons do Sistema">
        <SettingsSlider label="Volume efeitos" value={audio.effectsVolume} min={0} max={100} step={5} unit="%" onChange={(v) => updateAudio({ effectsVolume: v })} />
        <SettingsToggle label="Som ao mudar turno (sino)" checked={audio.turnChangeSound} onChange={(v) => updateAudio({ turnChangeSound: v })} />
        <SettingsToggle label="Som ao rolar dados (click)" checked={audio.diceSound} onChange={(v) => updateAudio({ diceSound: v })} />
        <SettingsToggle label="Som ao receber dano (impacto)" checked={audio.damageSound} onChange={(v) => updateAudio({ damageSound: v })} />
        <SettingsToggle label="Som ao receber cura (brilho)" checked={audio.healSound} onChange={(v) => updateAudio({ healSound: v })} />
        <SettingsToggle label="Som ao Nat 20 (fanfarra)" checked={audio.nat20Sound} onChange={(v) => updateAudio({ nat20Sound: v })} />
        <SettingsToggle label="Som ao Nat 1 (triste)" checked={audio.nat1Sound} onChange={(v) => updateAudio({ nat1Sound: v })} />
        <SettingsToggle label="Som de mensagem no chat (pop)" checked={audio.chatSound} onChange={(v) => updateAudio({ chatSound: v })} />
        <SettingsToggle label="Som de jogador conectando (chime)" checked={audio.joinSound} onChange={(v) => updateAudio({ joinSound: v })} />
        <SettingsToggle label="Som de notificação (bell)" checked={audio.notificationSound} onChange={(v) => updateAudio({ notificationSound: v })} />
        <div className="border-t border-white/5 pt-3">
          <SettingsToggle label="Mutar todos os sons" checked={audio.muteAll} onChange={(v) => updateAudio({ muteAll: v })} />
          <SettingsToggle label="Respeitar modo silencioso do dispositivo" checked={audio.respectSilentMode} onChange={(v) => updateAudio({ respectSilentMode: v })} />
        </div>
      </SettingsSection>

      <SettingsSection title="Controles Pessoais (Jogador)">
        <SettingsSlider label="Volume pessoal" value={audio.personalVolume} min={0} max={100} step={5} unit="%" onChange={(v) => updateAudio({ personalVolume: v })} />
        <SettingsToggle label="Mutar trilha sonora (só pra mim)" checked={audio.personalMuteMusic} onChange={(v) => updateAudio({ personalMuteMusic: v })} />
        <SettingsToggle label="Mutar efeitos sonoros (só pra mim)" checked={audio.personalMuteEffects} onChange={(v) => updateAudio({ personalMuteEffects: v })} />
      </SettingsSection>
    </div>
  );
}
