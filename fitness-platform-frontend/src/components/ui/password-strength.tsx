import * as React from "react"
import { cn } from "@/lib/utils"
import { Check, X } from "lucide-react"

interface PasswordStrengthProps {
    password: string
    className?: string
    showRequirements?: boolean
}

interface Requirement {
    label: string
    test: (password: string) => boolean
}

const requirements: Requirement[] = [
    { label: "At least 8 characters", test: (p) => p.length >= 8 },
    { label: "Contains uppercase letter", test: (p) => /[A-Z]/.test(p) },
    { label: "Contains lowercase letter", test: (p) => /[a-z]/.test(p) },
    { label: "Contains number", test: (p) => /\d/.test(p) },
    { label: "Contains special character", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
]

function getStrength(password: string): number {
    if (!password) return 0
    const passed = requirements.filter((req) => req.test(password)).length
    return Math.round((passed / requirements.length) * 100)
}

function getStrengthLabel(strength: number): { label: string; color: string } {
    if (strength === 0) return { label: "", color: "" }
    if (strength < 40) return { label: "Weak", color: "text-red-500" }
    if (strength < 60) return { label: "Fair", color: "text-orange-500" }
    if (strength < 80) return { label: "Good", color: "text-yellow-500" }
    return { label: "Strong", color: "text-green-500" }
}

function getBarColor(strength: number): string {
    if (strength < 40) return "bg-red-500"
    if (strength < 60) return "bg-orange-500"
    if (strength < 80) return "bg-yellow-500"
    return "bg-green-500"
}

const PasswordStrength = React.forwardRef<HTMLDivElement, PasswordStrengthProps>(
    ({ password, className, showRequirements = true }, ref) => {
        const strength = getStrength(password)
        const { label, color } = getStrengthLabel(strength)

        return (
            <div ref={ref} className={cn("space-y-2", className)}>
                {/* Strength Bar */}
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Password strength</span>
                        <span className={cn("font-medium", color)}>{label}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                            className={cn("h-full transition-all duration-300", getBarColor(strength))}
                            style={{ width: `${strength}%` }}
                        />
                    </div>
                </div>

                {/* Requirements Checklist */}
                {showRequirements && password && (
                    <ul className="grid grid-cols-1 gap-1 text-xs">
                        {requirements.map((req, index) => {
                            const passed = req.test(password)
                            return (
                                <li
                                    key={index}
                                    className={cn(
                                        "flex items-center gap-1.5 transition-colors",
                                        passed ? "text-green-600" : "text-muted-foreground"
                                    )}
                                >
                                    {passed ? (
                                        <Check className="h-3 w-3" />
                                    ) : (
                                        <X className="h-3 w-3" />
                                    )}
                                    {req.label}
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>
        )
    }
)
PasswordStrength.displayName = "PasswordStrength"

export { PasswordStrength, getStrength, requirements }
