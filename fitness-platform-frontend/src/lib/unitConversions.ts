export type UnitSystem = 'metric' | 'imperial'

// Weight conversions
export const kgToLbs = (kg: number): number => {
    return kg * 2.20462
}

export const lbsToKg = (lbs: number): number => {
    return lbs / 2.20462
}

// Length conversions
export const cmToInches = (cm: number): number => {
    return cm / 2.54
}

export const inchesToCm = (inches: number): number => {
    return inches * 2.54
}

export const cmToFeetInches = (cm: number): { feet: number; inches: number } => {
    const totalInches = cmToInches(cm)
    let feet = Math.floor(totalInches / 12)
    let inches = Math.round(totalInches % 12)

    if (inches === 12) {
        feet += 1
        inches = 0
    }

    return { feet, inches }
}

export const feetInchesToCm = (feet: number, inches: number): number => {
    return inchesToCm(feet * 12 + inches)
}

// Display helpers
export const formatWeight = (kg: number | undefined | null, system: UnitSystem): string => {
    if (kg === undefined || kg === null) return '--'

    if (system === 'metric') {
        return `${kg.toFixed(1)} kg`
    }
    return `${kgToLbs(kg).toFixed(1)} lbs`
}

export const formatLength = (cm: number | undefined | null, system: UnitSystem): string => {
    if (cm === undefined || cm === null) return '--'

    if (system === 'metric') {
        return `${Math.round(cm)} cm`
    }
    return `${Math.round(cmToInches(cm))} in`
}

export const formatHeight = (cm: number | undefined | null, system: UnitSystem): string => {
    if (cm === undefined || cm === null) return '--'

    if (system === 'metric') {
        return `${Math.round(cm)} cm`
    }
    const { feet, inches } = cmToFeetInches(cm)
    return `${feet}'${inches}"`
}
