import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface YesNoRadioProps {
  id: string;
  label: string;
  value: "yes" | "no" | null;
  onChange: (value: "yes" | "no" | null) => void;
  className?: string;
}

export function YesNoRadio({ id, label, value, onChange, className }: YesNoRadioProps) {
  return (
    <div className={cn("flex items-center space-x-4", className)}>
      <Label htmlFor={id} className="text-sm font-medium text-gray-700">{label}</Label>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id={`${id}-yes`}
            name={id}
            value="yes"
            checked={value === "yes"}
            onChange={() => onChange("yes")}
            className="h-4 w-4 text-[#FEBF19] focus:ring-[#FEBF19] border-gray-300"
          />
          <Label htmlFor={`${id}-yes`} className="text-sm font-medium text-gray-700">
            Sí
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="radio"
            id={`${id}-no`}
            name={id}
            value="no"
            checked={value === "no"}
            onChange={() => onChange("no")}
            className="h-4 w-4 text-[#FEBF19] focus:ring-[#FEBF19] border-gray-300"
          />
          <Label htmlFor={`${id}-no`} className="text-sm font-medium text-gray-700">
            No
          </Label>
        </div>
      </div>
    </div>
  )
} 