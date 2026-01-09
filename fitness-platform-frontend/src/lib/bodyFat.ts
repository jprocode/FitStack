export function calculateBodyFat(
    gender: string,
    heightCm: number,
    neckCm: number,
    waistCm: number,
    hipsCm?: number
): number | null {
    if (!heightCm || !neckCm || !waistCm) return null

    // Clean gender string
    const normalizedGender = gender.toLowerCase().trim()
    const isMale = normalizedGender === 'male' || normalizedGender === 'man' || normalizedGender === 'm'

    if (isMale) {
        if (waistCm - neckCm <= 0) return null
        // 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
        const logWaistNeck = Math.log10(waistCm - neckCm)
        const logHeight = Math.log10(heightCm)
        const bodyFat = 495.0 / (1.0324 - 0.19077 * logWaistNeck + 0.15456 * logHeight) - 450.0
        return Math.round(bodyFat * 10) / 10
    } else {
        // Female requires hips
        if (!hipsCm) return null
        if (waistCm + hipsCm - neckCm <= 0) return null
        // 495 / (1.29579 - 0.35004 * log10(waist + hips - neck) + 0.22100 * log10(height)) - 450
        const logWaistHipsNeck = Math.log10(waistCm + hipsCm - neckCm)
        const logHeight = Math.log10(heightCm)
        const bodyFat = 495.0 / (1.29579 - 0.35004 * logWaistHipsNeck + 0.22100 * logHeight) - 450.0
        return Math.round(bodyFat * 10) / 10
    }
}
