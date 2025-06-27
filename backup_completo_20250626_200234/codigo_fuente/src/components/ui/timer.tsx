"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface TimerProps {
  startTime: Date
  className?: string
}

export function Timer({ startTime, className }: TimerProps) {
  const [elapsed, setElapsed] = useState<string>("00:00:00")

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const diff = now.getTime() - startTime.getTime()

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setElapsed(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      )
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <svg
        className="h-5 w-5 text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span className="text-lg font-mono font-medium text-gray-900">
        {elapsed}
      </span>
    </div>
  )
} 