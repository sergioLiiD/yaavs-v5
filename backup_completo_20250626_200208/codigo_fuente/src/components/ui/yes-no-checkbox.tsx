"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface YesNoCheckboxProps {
  id: string
  label: string
  value: "yes" | "no" | null
  onChange: (value: "yes" | "no" | null) => void
  className?: string
}

export function YesNoCheckbox({ id, label, value, onChange, className }: YesNoCheckboxProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Checkbox
        id={id}
        checked={value === "yes"}
        onCheckedChange={(checked) => onChange(checked ? "yes" : "no")}
      />
      <Label htmlFor={id}>{label}</Label>
    </div>
  )
} 