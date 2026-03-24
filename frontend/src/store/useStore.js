import { create } from 'zustand';

export const useStore = create((set) => ({
  // Auth — persisted in localStorage
  token:  localStorage.getItem('access_token') || null,
  farmer: JSON.parse(localStorage.getItem('farmer') || 'null'),

  setToken: (token) => {
    localStorage.setItem('access_token', token);
    set({ token });
  },

  setFarmer: (farmer) => {
    localStorage.setItem('farmer', JSON.stringify(farmer));
    set({ farmer });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('farmer');
    set({ token: null, farmer: null, farms: [], crops: [] });
  },

  // Farm data
  farms: [],
  crops: [],
  setFarms: (farms) => set({ farms }),
  setCrops: (crops) => set({ crops }),
}));
