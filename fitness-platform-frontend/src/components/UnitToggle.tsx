import { useSettingsStore } from '@/store/settingsStore'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export function UnitToggle() {
    const { unitSystem, toggleUnitSystem } = useSettingsStore()

    return (
        <div className="flex items-center space-x-2">
            <Switch
                id="unit-toggle"
                checked={unitSystem === 'imperial'}
                onCheckedChange={toggleUnitSystem}
            />
            <Label htmlFor="unit-toggle" className="cursor-pointer">
                {unitSystem === 'metric' ? 'Metric (kg/cm)' : 'Imperial (lbs/in)'}
            </Label>
        </div>
    )
}
