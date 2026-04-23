import { Audio } from "expo-av";

// Cache em memória — persiste durante a sessão, reseta ao fechar o app
const soundCache = new Map<string, Audio.Sound>();
const loadingPromises = new Map<string, Promise<Audio.Sound>>();

export async function playSound(
  key: string,
  uri: string,
  volume = 1.0,
): Promise<void> {
  // Se já está carregado, toca direto
  if (soundCache.has(key)) {
    const sound = soundCache.get(key)!;
    try {
      await sound.setVolumeAsync(volume);
      await sound.setPositionAsync(0);
      await sound.playAsync();
    } catch {
      // Som foi descarregado, remove do cache e tenta novamente
      soundCache.delete(key);
      return playSound(key, uri, volume);
    }
    return;
  }

  // Se já está sendo carregado (toque duplo rápido), aguarda a Promise existente
  if (loadingPromises.has(key)) {
    const sound = await loadingPromises.get(key)!;
    await sound.setPositionAsync(0);
    await sound.playAsync();
    return;
  }

  // Primeira vez: cria, cacheia e toca
  const loadPromise = Audio.Sound.createAsync(
    { uri },
    { shouldPlay: false, volume },
  ).then(({ sound }) => {
    soundCache.set(key, sound);
    loadingPromises.delete(key);
    return sound;
  });

  loadingPromises.set(key, loadPromise);
  const sound = await loadPromise;
  await sound.playAsync();
}

export async function stopSound(key: string): Promise<void> {
  if (soundCache.has(key)) {
    try {
      await soundCache.get(key)!.stopAsync();
    } catch {
      // ignore
    }
  }
}

export async function unloadAll(): Promise<void> {
  for (const [, sound] of soundCache) {
    try {
      await sound.unloadAsync();
    } catch {
      // ignore
    }
  }
  soundCache.clear();
  loadingPromises.clear();
}
