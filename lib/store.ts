"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  battery: number | null;
  setBattery: (battery: number | null) => void;
  chargeThreshold: number;
  setChargeThreshold: (threshold: number) => void;
  preferCharger: boolean;
  setPreferCharger: (prefer: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      battery: null,
      setBattery: (battery) => set({ battery }),
      chargeThreshold: 30,
      setChargeThreshold: (threshold) => set({ chargeThreshold: threshold }),
      preferCharger: false,
      setPreferCharger: (prefer) => set({ preferCharger: prefer }),
    }),
    {
      name: "app-storage",
    }
  )
);
