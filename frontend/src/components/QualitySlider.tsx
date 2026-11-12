import { Slider } from "@/components/ui/slider"

type Props = {
  value: number
  onChange: (quality: number) => void
  disabled?: boolean
}

export function QualitySlider({ value, onChange, disabled }: Props) {
  return (
    <div className="flex w-64 flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span>Quality</span>
        <span className="tabular-nums text-muted-foreground">{value}%</span>
      </div>
      <Slider
        min={1}
        max={100}
        step={1}
        value={[value]}
        onValueChange={(v) => onChange(typeof v === "number" ? v : v[0])}
        disabled={disabled}
      />
    </div>
  )
}