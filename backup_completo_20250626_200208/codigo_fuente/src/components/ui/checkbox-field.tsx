import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface CheckboxFieldProps {
  id: string;
  label: string;
  value: boolean;
  onChange: (checked: boolean) => void;
}

export function CheckboxField({ id, label, value, onChange }: CheckboxFieldProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={id}
        checked={value}
        onCheckedChange={onChange}
      />
      <Label htmlFor={id}>{label}</Label>
    </div>
  )
} 