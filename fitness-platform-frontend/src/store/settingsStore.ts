import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UnitSystem } from '@/lib/unitConversions'

interface SettingsState {
    unitSystem: UnitSystem
    setUnitSystem: (system: UnitSystem) => void
    toggleUnitSystem: () => void
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            unitSystem: 'metric',
            setUnitSystem: (system) => set({ unitSystem: system }),
            toggleUnitSystem: () =>
                set((state) => ({
                    unitSystem: state.unitSystem === 'metric' ? 'imperial' : 'metric'
                })),
        }),
        {
            name: 'fitstack-settings',
        }
    )
)
