import AsyncStorage from "@react-native-async-storage/async-storage";
import type { TokenCache } from "@clerk/clerk-expo";

export const tokenCache: TokenCache = {
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
