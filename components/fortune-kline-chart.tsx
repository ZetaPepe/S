"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface YearlyFortune {
  age: number
  year: string
  overall: number
  wealth: number
  career: number
  love: number
  children: number
  health: number
  trend: string
  keyEvents: string
}

interface FortuneData {
  bazi: string
  summary: string
  yearlyData: YearlyFortune[]
  lifePhases: {
    childhood: string
    youth: string
    middleAge: string
    oldAge: string
  }
  criticalPoints: Array<{
    age: number
    description: string
  }>
}

interface FortuneKLineChartProps {
  data: FortuneData
}

type FortuneCategory = "overall" | "wealth" | "career"

export function FortuneKLineChart({ data }: FortuneKLineChartProps) {
  const [selectedCategory, setSelectedCategory] = useState<FortuneCategory>("overall")
  const [hoveredAge, setHoveredAge] = useState<number | null>(null)

  const categories = [
    { key: "overall" as FortuneCategory, label: "总运势", color: "#8b5cf6" },
    { key: "wealth" as FortuneCategory, label: "财运", color: "#22c55e" },
    { key: "career" as FortuneCategory, label: "事业", color: "#3b82f6" },
  ]

  const chartWidth = 1200
  const chartHeight = 500
  const padding = { top: 60, right: 60, bottom: 80, left: 80 }
  const plotWidth = chartWidth - padding.left - padding.right
  const plotHeight = chartHeight - padding.top - padding.bottom

  const generateLinePath = () => {
    if (!data.yearlyData || data.yearlyData.length === 0) return ""

    return data.yearlyData
      .map((yearData, index) => {
        const x = padding.left + (yearData.age / 100) * plotWidth
        const y = padding.top + plotHeight - (yearData[selectedCategory] / 100) * plotHeight
        return `${index === 0 ? "M" : "L"} ${x} ${y}`
      })
      .join(" ")
  }

  const generateAreaPath = () => {
    if (!data.yearlyData || data.yearlyData.length === 0) return ""

    const linePath = data.yearlyData
      .map((yearData, index) => {
        const x = padding.left + (yearData.age / 100) * plotWidth
        const y = padding.top + plotHeight - (yearData[selectedCategory] / 100) * plotHeight
        return `${index === 0 ? "M" : "L"} ${x} ${y}`
      })
      .join(" ")

    const lastX = padding.left + (data.yearlyData[data.yearlyData.length - 1].age / 100) * plotWidth
    const bottomY = padding.top + plotHeight

    return `${linePath} L ${lastX} ${bottomY} L ${padding.left} ${bottomY} Z`
  }

  const hoveredData = hoveredAge !== null ? data.yearlyData[hoveredAge] : null
  const currentColor = categories.find((c) => c.key === selectedCategory)?.color || "#8b5cf6"

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="border-4 border-white bg-black/90 p-6">
        <div className="space-y-4">
          <div className="border-b-2 border-white/20 pb-4">
            <h3 className="font-serif text-3xl font-bold text-white mb-2">百岁流年走势图 (100年)</h3>
            <div className="font-mono text-sm text-white/60">
              结合传统八字命理与金融可视化技术，将您的一生运势绘制成趋势图
            </div>
          </div>

          {/* Eight Characters Display */}
          <div className="bg-white/5 border-2 border-white/10 p-4">
            <div className="font-mono text-xs text-white/50 mb-1">八字命盘</div>
            <div className="font-serif text-lg text-white">{data.bazi}</div>
          </div>

          {/* Summary */}
          <div className="bg-white/5 border-2 border-white/10 p-4">
            <div className="font-mono text-xs text-white/50 mb-2">命理摘要</div>
            <div className="font-mono text-sm text-white/80 leading-relaxed">{data.summary}</div>
          </div>
        </div>
      </Card>

      {/* Category Selector */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <Button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            variant={selectedCategory === cat.key ? "default" : "outline"}
            className="border-2 border-white font-mono font-bold text-sm h-10"
            style={selectedCategory === cat.key ? { backgroundColor: cat.color, borderColor: cat.color } : {}}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Line Chart */}
      <Card className="border-4 border-white bg-black/90 p-6 overflow-x-auto">
        <div className="min-w-[1200px]">
          <div className="mb-4">
            <h4 className="font-serif text-xl font-bold text-white mb-1">
              流年运势 K 线 <span style={{ color: currentColor }}>・建格格</span>
            </h4>
            <div className="font-mono text-xs text-white/60">
              格局直准分：<span className="text-white font-bold">{data.yearlyData[0]?.[selectedCategory] || 72}</span>{" "}
              ・ 大运周期：10年一变
            </div>
          </div>

          <svg width={chartWidth} height={chartHeight} className="w-full">
            {/* Grid lines - Y axis */}
            {[0, 25, 50, 75, 100].map((value) => {
              const y = padding.top + plotHeight - (value / 100) * plotHeight
              return (
                <g key={`y-${value}`}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 15}
                    y={y + 5}
                    fill="rgba(255,255,255,0.5)"
                    fontSize="12"
                    textAnchor="end"
                    fontFamily="monospace"
                  >
                    {value}
                  </text>
                </g>
              )
            })}

            {/* Grid lines - X axis (every 10 years) */}
            {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((age) => {
              const x = padding.left + (age / 100) * plotWidth
              return (
                <g key={`x-${age}`}>
                  <line
                    x1={x}
                    y1={padding.top}
                    x2={x}
                    y2={padding.top + plotHeight}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={padding.top + plotHeight + 25}
                    fill="rgba(255,255,255,0.5)"
                    fontSize="12"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {age}
                  </text>
                </g>
              )
            })}

            {/* Area fill under line */}
            <path d={generateAreaPath()} fill={currentColor} opacity="0.1" />

            {/* Fortune line */}
            <path
              d={generateLinePath()}
              fill="none"
              stroke={currentColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {data.yearlyData.map((yearData, index) => {
              const x = padding.left + (yearData.age / 100) * plotWidth
              const y = padding.top + plotHeight - (yearData[selectedCategory] / 100) * plotHeight
              const isHovered = hoveredAge === index

              // Only show every 5th point to avoid clutter, or if hovered
              if (index % 5 !== 0 && !isHovered) return null

              return (
                <g
                  key={index}
                  onMouseEnter={() => setHoveredAge(index)}
                  onMouseLeave={() => setHoveredAge(null)}
                  style={{ cursor: "pointer" }}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={isHovered ? 8 : 4}
                    fill={currentColor}
                    stroke="white"
                    strokeWidth={isHovered ? 3 : 2}
                    opacity={isHovered ? 1 : 0.8}
                  />
                  {isHovered && (
                    <>
                      <circle cx={x} cy={y} r={15} fill="none" stroke={currentColor} strokeWidth="2" opacity="0.3" />
                      <text
                        x={x}
                        y={y - 25}
                        fill="white"
                        fontSize="14"
                        fontWeight="bold"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {yearData[selectedCategory]}
                      </text>
                    </>
                  )}
                </g>
              )
            })}

            {/* Critical points markers */}
            {data.criticalPoints?.map((point, index) => {
              const x = padding.left + (point.age / 100) * plotWidth
              const pointData = data.yearlyData.find((d) => d.age === point.age)
              const y = pointData
                ? padding.top + plotHeight - (pointData[selectedCategory] / 100) * plotHeight
                : padding.top + plotHeight / 2

              return (
                <g key={`critical-${index}`}>
                  <circle cx={x} cy={y} r="8" fill="#fbbf24" stroke="white" strokeWidth="3" />
                  <text x={x} y={y - 20} fill="#fbbf24" fontSize="16" textAnchor="middle">
                    ⚡
                  </text>
                </g>
              )
            })}

            {/* Axis labels */}
            <text
              x={chartWidth / 2}
              y={chartHeight - 20}
              fill="rgba(255,255,255,0.6)"
              fontSize="14"
              textAnchor="middle"
              fontWeight="bold"
              fontFamily="monospace"
            >
              年龄 (虚岁)
            </text>

            <text
              x={padding.left - 55}
              y={chartHeight / 2}
              fill="rgba(255,255,255,0.6)"
              fontSize="14"
              textAnchor="middle"
              fontWeight="bold"
              fontFamily="monospace"
              transform={`rotate(-90, ${padding.left - 55}, ${chartHeight / 2})`}
            >
              运势
            </text>

            {/* Chart border */}
            <rect
              x={padding.left}
              y={padding.top}
              width={plotWidth}
              height={plotHeight}
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="2"
            />
          </svg>

          {/* Hover Info Display */}
          {hoveredData && (
            <div className="mt-4 bg-white/5 border-2 border-white/20 p-4" style={{ borderColor: currentColor }}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div>
                  <div className="font-mono text-xs text-white/50">年龄</div>
                  <div className="font-bold text-white">{hoveredData.age}岁</div>
                </div>
                <div>
                  <div className="font-mono text-xs text-white/50">年份</div>
                  <div className="font-bold text-white">{hoveredData.year}</div>
                </div>
                <div>
                  <div className="font-mono text-xs text-white/50">运势趋势</div>
                  <div className="font-bold text-white">{hoveredData.trend}</div>
                </div>
                <div>
                  <div className="font-mono text-xs text-white/50">
                    {categories.find((c) => c.key === selectedCategory)?.label}
                  </div>
                  <div className="font-bold" style={{ color: currentColor }}>
                    {hoveredData[selectedCategory]}分
                  </div>
                </div>
              </div>
              <div>
                <div className="font-mono text-xs text-white/50 mb-1">流年详批</div>
                <div className="font-mono text-sm text-white/80">{hoveredData.keyEvents}</div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Life Phases Summary */}
      <Card className="border-4 border-white bg-black/90 p-6">
        <h4 className="font-serif text-xl font-bold text-white mb-4">人生阶段运势总结</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white/5 border-2 border-white/10 p-4">
            <div className="font-mono text-xs text-accent mb-2">童年期 (0-18岁)</div>
            <div className="font-mono text-sm text-white/80">{data.lifePhases?.childhood}</div>
          </div>
          <div className="bg-white/5 border-2 border-white/10 p-4">
            <div className="font-mono text-xs text-accent mb-2">青年期 (19-35岁)</div>
            <div className="font-mono text-sm text-white/80">{data.lifePhases?.youth}</div>
          </div>
          <div className="bg-white/5 border-2 border-white/10 p-4">
            <div className="font-mono text-xs text-accent mb-2">中年期 (36-60岁)</div>
            <div className="font-mono text-sm text-white/80">{data.lifePhases?.middleAge}</div>
          </div>
          <div className="bg-white/5 border-2 border-white/10 p-4">
            <div className="font-mono text-xs text-accent mb-2">老年期 (61-100岁)</div>
            <div className="font-mono text-sm text-white/80">{data.lifePhases?.oldAge}</div>
          </div>
        </div>
      </Card>

      {/* Critical Points */}
      {data.criticalPoints && data.criticalPoints.length > 0 && (
        <Card className="border-4 border-white bg-black/90 p-6">
          <h4 className="font-serif text-xl font-bold text-white mb-4">人生关键转折点</h4>
          <div className="space-y-3">
            {data.criticalPoints.map((point, index) => (
              <div key={index} className="bg-white/5 border-l-4 border-accent p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-accent flex items-center justify-center font-bold text-black flex-shrink-0">
                    {point.age}岁
                  </div>
                  <div className="flex-1">
                    <div className="font-mono text-sm text-white/80">{point.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
