import { create } from 'zustand';
import { DEFAULT_LANGUAGE, normalizeLanguage } from '../i18n';

const storedFarmer = JSON.parse(localStorage.getItem('farmer') || 'null');
const storedLanguage = normalizeLanguage(
  localStorage.getItem('preferred_language') || storedFarmer?.preferred_language || DEFAULT_LANGUAGE
);

localStorage.setItem('preferred_language', storedLanguage);

export const useStore = create((set) => ({
  token: localStorage.getItem('access_token') || null,
  farmer: storedFarmer,
  language: storedLanguage,
  farmingType: localStorage.getItem('farming_type') || null,

  setToken: (token) => {
    localStorage.setItem('access_token', token);
    set({ token });
  },

  setFarmer: (farmer) => {
    const nextLanguage = normalizeLanguage(
      farmer?.preferred_language || localStorage.getItem('preferred_language') || DEFAULT_LANGUAGE
    );
    const nextFarmer = farmer ? { ...farmer, preferred_language: nextLanguage } : null;

    if (nextFarmer) {
      localStorage.setItem('farmer', JSON.stringify(nextFarmer));
    } else {
      localStorage.removeItem('farmer');
    }

    localStorage.setItem('preferred_language', nextLanguage);
    set({ farmer: nextFarmer, language: nextLanguage });
  },

  setLanguage: (language) => {
    const nextLanguage = normalizeLanguage(language);
    localStorage.setItem('preferred_language', nextLanguage);

    set((state) => {
      const nextFarmer = state.farmer ? { ...state.farmer, preferred_language: nextLanguage } : null;
      if (nextFarmer) {
        localStorage.setItem('farmer', JSON.stringify(nextFarmer));
      }

      return {
        language: nextLanguage,
        farmer: nextFarmer ?? state.farmer,
      };
    });
  },

  setFarmingType: (farmingType) => {
    localStorage.setItem('farming_type', farmingType);
    set({ farmingType });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('farmer');
    localStorage.removeItem('farming_type');
    set({
      token: null,
      farmer: null,
      language: normalizeLanguage(localStorage.getItem('preferred_language') || DEFAULT_LANGUAGE),
      farmingType: null,
      farms: [],
      crops: [],
    });
  },

  farms: [],
  crops: [],
  setFarms: (farms) => set({ farms }),
  setCrops: (crops) => set({ crops }),
}));
