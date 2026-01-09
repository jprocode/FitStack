/**
 * Calorie calculator using the Mifflin-St Jeor BMR formula.
 * 
 * BMR (Basal Metabolic Rate):
 * - Male: (10 × weight in kg) + (6.25 × height in cm) − (5 × age in years) + 5
 * - Female: (10 × weight in kg) + (6.25 × height in cm) − (5 × age in years) − 161
 */

// Activity level multipliers for TDEE
export const ACTIVITY_MULTIPLIERS = {
    SEDENTARY: 1.2,       // Little/no exercise
    LIGHT: 1.375,         // 1-3 days/week
    MODERATE: 1.55,       // 3-5 days/week
    ACTIVE: 1.725,        // 6-7 days/week
    VERY_ACTIVE: 1.9,     // Twice daily
} as const

export type ActivityLevel = keyof typeof ACTIVITY_MULTIPLIERS

export interface CalorieTargets {
    bmr: number
    tdee: number
    maintenanceCalories: number
    weightLossCalories: number
    muscleGainCalories: number
}

/**
 * Calculate BMR using Mifflin-St Jeor formula.
 */
export function calculateBMR(
    weightKg: number,
    heightCm: number,
    ageYears: number,
    gender: string
): number | null {
    if (!weightKg || !heightCm || ageYears <= 0 || !gender) {
        return null
    }

    // (10 × weight) + (6.25 × height) − (5 × age)
    const base = (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears)

    const genderLower = gender.toLowerCase()
    if (genderLower === 'male' || genderLower === 'man') {
        return Math.round(base + 5)
    } else if (genderLower === 'female' || genderLower === 'woman') {
        return Math.round(base - 161)
    }

    return null
}

/**
 * Get activity level multiplier from string.
 */
export function getActivityMultiplier(activityLevel: string): number {
    const level = activityLevel?.toUpperCase() || 'SEDENTARY'

    switch (level) {
        case 'SEDENTARY': return ACTIVITY_MULTIPLIERS.SEDENTARY
        case 'LIGHT':
        case 'LIGHTLY_ACTIVE': return ACTIVITY_MULTIPLIERS.LIGHT
        case 'MODERATE':
        case 'MODERATELY_ACTIVE': return ACTIVITY_MULTIPLIERS.MODERATE
        case 'ACTIVE':
        case 'VERY_ACTIVE': return ACTIVITY_MULTIPLIERS.ACTIVE
        case 'EXTRA_ACTIVE':
        case 'EXTREMELY_ACTIVE': return ACTIVITY_MULTIPLIERS.VERY_ACTIVE
        default: return ACTIVITY_MULTIPLIERS.SEDENTARY
    }
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure).
 */
export function calculateTDEE(bmr: number, activityLevel: string): number {
    if (!bmr) return 0
    const multiplier = getActivityMultiplier(activityLevel)
    return Math.round(bmr * multiplier)
}

/**
 * Calculate all calorie targets from user data.
 */
export function calculateCalorieTargets(
    weightKg: number,
    heightCm: number,
    ageYears: number,
    gender: string,
    activityLevel: string
): CalorieTargets | null {
    const bmr = calculateBMR(weightKg, heightCm, ageYears, gender)
    if (!bmr) return null

    const tdee = calculateTDEE(bmr, activityLevel)

    return {
        bmr,
        tdee,
        maintenanceCalories: tdee,
        weightLossCalories: Math.round(tdee - 500),
        muscleGainCalories: Math.round(tdee + 300),
    }
}

/**
 * Calculate age from birth date.
 */
export function calculateAge(birthDate: string | Date): number {
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
    }
    return age
}
