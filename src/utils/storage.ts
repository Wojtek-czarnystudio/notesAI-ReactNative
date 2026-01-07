import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem('userToken', token);
  },

  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem('userToken');
  },

  async removeToken(): Promise<void> {
    await AsyncStorage.removeItem('userToken');
  },

  async setItem(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  },

  async getItem(key: string): Promise<string | null> {
    return await AsyncStorage.getItem(key);
  },

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  async clear(): Promise<void> {
    await AsyncStorage.clear();
  },
};
