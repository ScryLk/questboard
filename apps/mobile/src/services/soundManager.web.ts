// Web variant usando HTMLAudioElement nativo — mesma API pública que soundManager.ts
// Sons são instanciados apenas no primeiro playSound, nunca no module load.

const soundCache = new Map<string, HTMLAudioElement>();
const loadingPromises = new Map<string, Promise<HTMLAudioElement>>();

export async function playSound(
  key: string,
  uri: string,
  volume = 1.0,
): Promise<void> {
  // Se já está carregado, toca direto
  if (soundCache.has(key)) {
    const audio = soundCache.get(key)!;
    audio.volume = volume;
    audio.currentTime = 0;
    await audio.play();
    return;
  }

  // Se já está sendo carregado, aguarda
  if (loadingPromises.has(key)) {
    const audio = await loadingPromises.get(key)!;
    audio.currentTime = 0;
    await audio.play();
    return;
  }

  // Primeira vez: cria Audio sob demanda
  const loadPromise = new Promise<HTMLAudioElement>((resolve, reject) => {
    const audio = new Audio(uri);
    audio.volume = volume;
    audio.preload = "auto";
    audio.addEventListener(
      "canplaythrough",
      () => {
        soundCache.set(key, audio);
        loadingPromises.delete(key);
        resolve(audio);
      },
      { once: true },
    );
    audio.addEventListener(
      "error",
      () => {
        loadingPromises.delete(key);
        reject(new Error(`Failed to load sound: ${uri}`));
      },
      { once: true },
    );
    audio.load();
  });

  loadingPromises.set(key, loadPromise);
  const audio = await loadPromise;
  await audio.play();
}

export async function stopSound(key: string): Promise<void> {
  if (soundCache.has(key)) {
    const audio = soundCache.get(key)!;
    audio.pause();
    audio.currentTime = 0;
  }
}

export async function unloadAll(): Promise<void> {
  for (const [, audio] of soundCache) {
    audio.pause();
    audio.src = "";
  }
  soundCache.clear();
  loadingPromises.clear();
}
