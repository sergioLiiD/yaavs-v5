"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface PatternLockProps {
  onPatternComplete: (pattern: number[]) => void
  className?: string
}

export function PatternLock({ onPatternComplete, className }: PatternLockProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [pattern, setPattern] = useState<number[]>([])
  const [points, setPoints] = useState<{ x: number; y: number }[]>([])
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null)

  const gridSize = 3
  const cellSize = 60
  const dotRadius = 10
  const lineWidth = 4

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Configurar el canvas
    canvas.width = cellSize * gridSize
    canvas.height = cellSize * gridSize

    // Dibujar los puntos
    drawDots(ctx)
  }, [])

  const drawDots = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    
    // Dibujar los puntos
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = j * cellSize + cellSize / 2
        const y = i * cellSize + cellSize / 2
        
        ctx.beginPath()
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2)
        ctx.fillStyle = "#CBD5E1"
        ctx.fill()
        ctx.strokeStyle = "#64748B"
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }

    // Dibujar las líneas
    if (points.length > 1) {
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y)
      }
      if (currentPoint) {
        ctx.lineTo(currentPoint.x, currentPoint.y)
      }
      ctx.strokeStyle = "#3B82F6"
      ctx.lineWidth = lineWidth
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.stroke()
    }
  }

  const getPointFromCoordinates = (x: number, y: number): { x: number; y: number } | null => {
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const pointX = j * cellSize + cellSize / 2
        const pointY = i * cellSize + cellSize / 2
        
        const distance = Math.sqrt(
          Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2)
        )
        
        if (distance < dotRadius * 2) {
          return { x: pointX, y: pointY }
        }
      }
    }
    return null
  }

  const getPointIndex = (point: { x: number; y: number }): number => {
    const row = Math.floor(point.y / cellSize)
    const col = Math.floor(point.x / cellSize)
    return row * gridSize + col + 1
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const point = getPointFromCoordinates(x, y)
    if (point) {
      setIsDrawing(true)
      setPoints([point])
      setCurrentPoint(point)
      setPattern([getPointIndex(point)])
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const point = getPointFromCoordinates(x, y)
    if (point && !points.some(p => p.x === point.x && p.y === point.y)) {
      setPoints([...points, point])
      setCurrentPoint(point)
      setPattern([...pattern, getPointIndex(point)])
    } else {
      setCurrentPoint({ x, y })
    }

    const ctx = canvas.getContext("2d")
    if (ctx) {
      drawDots(ctx)
    }
  }

  const handleMouseUp = () => {
    if (isDrawing && pattern.length >= 4) {
      onPatternComplete(pattern)
    }
    setIsDrawing(false)
    setPoints([])
    setCurrentPoint(null)
    setPattern([])

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (ctx) {
      drawDots(ctx)
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <canvas
        ref={canvasRef}
        className="border rounded-lg bg-white"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <p className="text-sm text-gray-500">
        Dibuja un patrón con al menos 4 puntos
      </p>
    </div>
  )
} 