"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, Loader2 } from "lucide-react"

interface BaziData {
  gregorianDate: string
  lunarDate: string
  solarTime: string
  pillars: {
    year: string
    month: string
    day: string
    hour: string
  }
  majorLuck: {
    startAge: number
    direction: string
    periods: string[]
  }
}

interface BaziConfirmationProps {
  baziData: BaziData
  birthInfo: {
    name?: string
    gender: "male" | "female"
    location?: string
  }
  onConfirm: () => void
  onReenter: () => void
  isLoading?: boolean
}

export function BaziConfirmation({
  baziData,
  birthInfo,
  onConfirm,
  onReenter,
  isLoading = false,
}: BaziConfirmationProps) {
  return (
    <Card className="max-w-2xl mx-auto border-4 border-white bg-black/90 backdrop-blur-sm shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
      <div className="p-8 md:p-10">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
          <h3 className="font-serif text-3xl font-bold text-white">八字排盘完成</h3>
        </div>

        <p className="text-center font-mono text-sm text-white/60 mb-8">请确认以下信息，无误后点击"开始AI分析"</p>

        {/* Birth Information Section */}
        <div className="mb-6 p-5 bg-blue-950/30 border-2 border-blue-500/50">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-blue-500" />
            <h4 className="font-mono text-sm font-bold uppercase tracking-wide text-white">出生信息</h4>
          </div>
          <div className="grid md:grid-cols-2 gap-4 font-mono text-sm">
            <div>
              <span className="text-white/50">公历：</span>
              <span className="text-white font-medium">{baziData.gregorianDate}</span>
            </div>
            <div>
              <span className="text-white/50">地点：</span>
              <span className="text-white font-medium">{birthInfo.location || "未填写"}</span>
            </div>
            <div>
              <span className="text-white/50">农历：</span>
              <span className="text-white font-medium">{baziData.lunarDate}</span>
            </div>
            <div>
              <span className="text-white/50">性别：</span>
              <span className="text-white font-medium">{birthInfo.gender === "male" ? "男" : "女"}</span>
            </div>
          </div>
        </div>

        {/* Solar Time */}
        <div className="mb-6 p-4 bg-yellow-950/30 border-2 border-yellow-500/50">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-yellow-500" />
            <span className="font-mono text-xs text-yellow-200/80">真太阳时：</span>
            <span className="font-mono text-sm font-bold text-white">{baziData.solarTime}</span>
          </div>
        </div>

        {/* Four Pillars */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-purple-500" />
            <h4 className="font-mono text-sm font-bold uppercase tracking-wide text-white">四柱八字</h4>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "年柱", value: baziData.pillars.year },
              { label: "月柱", value: baziData.pillars.month },
              { label: "日柱", value: baziData.pillars.day },
              { label: "时柱", value: baziData.pillars.hour },
            ].map((pillar, i) => (
              <div key={i} className="bg-purple-950/40 border-2 border-purple-500/30 p-4">
                <div className="text-center">
                  <div className="font-mono text-xs text-purple-300/70 mb-2">{pillar.label}</div>
                  <div className="font-serif text-3xl font-bold text-purple-200">{pillar.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Major Luck Period */}
        <div className="mb-8 p-5 bg-white/5 border-2 border-white/10">
          <h4 className="font-mono text-sm font-bold mb-4 text-white">大运信息</h4>
          <div className="grid md:grid-cols-2 gap-4 mb-4 font-mono text-sm">
            <div>
              <span className="text-white/50">起运年龄：</span>
              <span className="text-accent font-bold">{baziData.majorLuck.startAge}岁 (虚岁)</span>
            </div>
            <div>
              <span className="text-white/50">大运方向：</span>
              <span className="text-accent font-bold">{baziData.majorLuck.direction}</span>
            </div>
          </div>
          <div>
            <div className="text-white/50 font-mono text-xs mb-2">前十步大运：</div>
            <div className="flex flex-wrap gap-2">
              {baziData.majorLuck.periods.slice(0, 9).map((period, i) => (
                <div key={i} className="px-3 py-1.5 bg-white/10 border border-white/20 font-mono text-sm text-white">
                  {i + 1}. {period}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4">
          <Button
            onClick={onReenter}
            variant="outline"
            disabled={isLoading}
            className="h-12 border-2 border-white bg-transparent text-white hover:bg-white/10 font-mono font-bold uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
          >
            重新输入
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="h-12 bg-accent hover:bg-accent/90 text-black border-4 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all font-mono font-bold uppercase tracking-wide disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                AI分析中...
              </span>
            ) : (
              "确认无误，开始AI分析"
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}
