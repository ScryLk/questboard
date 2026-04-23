import AsyncStorage from "@react-native-async-storage/async-storage";

// O type `TokenCache` do @clerk/clerk-expo mudou de lugar entre versões; em
// vez de importar, declaramos a shape localmente. Assim o arquivo compila
// independente da versão instalada, e fica funcional pra quando o backend
// mobile voltar a ser ligado.
interface TokenCacheShape {
  getToken: (key: string) => Promise<string | undefined | null>;
  saveToken: (key: string, value: string) => Promise<void>;
  clearToken?: (key: string) => Promise<void>;
}

export const tokenCache: TokenCacheShape = {
  async getToken(key: string) {
    return AsyncStorage.getItem(key);
  },
  async saveToken(key: string, value: string) {
    await AsyncStorage.setItem(key, value);
  },
  async clearToken(key: string) {
    await AsyncStorage.removeItem(key);
  },
};
