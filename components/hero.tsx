"use client"

import { useRef, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { SentientSphere } from "./sentient-sphere"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { FortuneKLineChart } from "./fortune-kline-chart"
import { BaziConfirmation } from "./bazi-confirmation"

interface FortuneData {
  bazi: string
  summary: string
  yearlyData: Array<{
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
  }>
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

export function Hero() {
  const containerRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])

  const [name, setName] = useState("")
  const [gender, setGender] = useState<"male" | "female">("male")
  const [year, setYear] = useState("1990")
  const [month, setMonth] = useState("1")
  const [day, setDay] = useState("1")
  const [hour, setHour] = useState("0")
  const [minute, setMinute] = useState("0")
  const [location, setLocation] = useState("")
  const [loading, setLoading] = useState(false)
  const [fortuneData, setFortuneData] = useState<FortuneData | null>(null)
  const [error, setError] = useState("")
  const [step, setStep] = useState<"form" | "confirmation" | "result">("form")
  const [baziData, setBaziData] = useState<BaziData | null>(null)

  const handleSubmit = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/bazi-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          birthInfo: {
            name,
            gender,
            year,
            month,
            day,
            hour,
            minute,
            location,
          },
        }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || "分析失败，请稍后重试")
      } else {
        setBaziData(data.baziData)
        setStep("confirmation")
      }
    } catch (err: any) {
      setError(err.message || "网络错误，请检查连接后重试")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmBazi = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/life-kline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          birthInfo: {
            name,
            gender,
            year,
            month,
            day,
            hour,
            minute,
            location,
          },
        }),
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.error || "生成K线图失败，请稍后重试")
      } else {
        setFortuneData(data.fortuneData)
        setStep("result")
      }
    } catch (err: any) {
      setError(err.message || "网络错误，请检查连接后重试")
    } finally {
      setLoading(false)
    }
  }

  const handleReenter = () => {
    setStep("form")
    setBaziData(null)
    setFortuneData(null)
    setError("")
  }

  return (
    <section ref={containerRef} className="relative min-h-screen w-full overflow-hidden bg-[#050505]">
      {/* 3D Sphere Background */}
      <div className="absolute inset-0">
        <SentientSphere />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-7xl"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-4 mb-8 px-6 py-3 border-4 border-white bg-black">
              <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-mono text-xl font-bold">
                命
              </div>
              <div className="text-left">
                <h2 className="font-serif text-2xl font-bold tracking-tight text-white">人生K线</h2>
                <p className="font-mono text-xs tracking-wider text-white/60">LIFE DESTINY K-LINE</p>
              </div>
            </div>

            <h3 className="font-serif text-4xl md:text-6xl font-bold mb-6 leading-tight text-white">
              <span className="block text-balance">洞悉命运起伏</span>
              <span className="block text-accent text-balance">预见人生轨迹</span>
            </h3>

            <p className="font-mono text-sm md:text-base max-w-3xl mx-auto leading-relaxed text-white/60">
              结合<span className="text-white font-bold">传统八字命理</span>与
              <span className="text-white font-bold">金融可视化技术</span>
              将您的一生运势绘制成类似股票行情的K线图。
              <br />
              助您发现人生牛市，规避风险熊市，把握关键转折点。
            </p>
          </div>

          {step === "form" && (
            <>
              {/* Form Card */}
              <Card className="max-w-2xl mx-auto border-4 border-white bg-black/90 backdrop-blur-sm shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
                <div className="p-8 md:p-10">
                  {/* Title */}
                  <div className="mb-6 pb-4 border-b-2 border-white/20">
                    <h4 className="font-serif text-2xl font-bold mb-2 text-white">八字排盘</h4>
                    <p className="font-mono text-xs text-white/60">填写出生信息，AI自动解卦并分析</p>
                  </div>

                  {/* Form */}
                  <div className="space-y-5">
                    {/* Name Input */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="font-mono text-xs font-bold uppercase tracking-wide text-white/80"
                      >
                        姓名 (可选)
                      </Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="姓名"
                        className="border-2 border-white/30 bg-black/50 text-white placeholder:text-white/30 focus:border-accent font-mono h-11"
                      />
                    </div>

                    {/* Gender Selection */}
                    <div className="space-y-2">
                      <Label className="font-mono text-xs font-bold uppercase tracking-wide text-white/80">性别</Label>
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant={gender === "male" ? "default" : "outline"}
                          onClick={() => setGender("male")}
                          className="flex-1 h-11 border-2 border-white font-mono font-bold text-sm"
                        >
                          男
                        </Button>
                        <Button
                          type="button"
                          variant={gender === "female" ? "default" : "outline"}
                          onClick={() => setGender("female")}
                          className="flex-1 h-11 border-2 border-white font-mono font-bold text-sm"
                        >
                          女
                        </Button>
                      </div>
                    </div>

                    {/* Birth Date */}
                    <div className="space-y-2">
                      <Label className="font-mono text-xs font-bold uppercase tracking-wide text-white/80">
                        出生日期 (公历)
                      </Label>
                      <div className="grid grid-cols-3 gap-3">
                        <Input
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          placeholder="1990"
                          className="border-2 border-white/30 bg-black/50 text-white placeholder:text-white/30 focus:border-accent font-mono h-11 text-center"
                        />
                        <Input
                          value={month}
                          onChange={(e) => setMonth(e.target.value)}
                          placeholder="1"
                          className="border-2 border-white/30 bg-black/50 text-white placeholder:text-white/30 focus:border-accent font-mono h-11 text-center"
                        />
                        <Input
                          value={day}
                          onChange={(e) => setDay(e.target.value)}
                          placeholder="1"
                          className="border-2 border-white/30 bg-black/50 text-white placeholder:text-white/30 focus:border-accent font-mono h-11 text-center"
                        />
                      </div>
                    </div>

                    {/* Birth Time */}
                    <div className="space-y-2">
                      <Label className="font-mono text-xs font-bold uppercase tracking-wide text-white/80">
                        出生时间
                      </Label>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          value={hour}
                          onChange={(e) => setHour(e.target.value)}
                          placeholder="0"
                          className="border-2 border-white/30 bg-black/50 text-white placeholder:text-white/30 focus:border-accent font-mono h-11 text-center"
                        />
                        <Input
                          value={minute}
                          onChange={(e) => setMinute(e.target.value)}
                          placeholder="0"
                          className="border-2 border-white/30 bg-black/50 text-white placeholder:text-white/30 focus:border-accent font-mono h-11 text-center"
                        />
                      </div>
                    </div>

                    {/* Birth Location */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="location"
                        className="font-mono text-xs font-bold uppercase tracking-wide text-white/80"
                      >
                        出生地点
                      </Label>
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="如：北京市、上海市浦东新区"
                        className="border-2 border-white/30 bg-black/50 text-white placeholder:text-white/30 focus:border-accent font-mono h-11"
                      />
                    </div>

                    {/* Verification Badge */}
                    <div className="bg-white/5 border-2 border-white/10 p-3">
                      <div className="flex items-start gap-3">
                        <div className="w-4 h-4 bg-accent flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-mono text-xs font-bold mb-1 text-white/80">模型验证资费</p>
                          <div className="flex flex-wrap gap-3 items-center text-xs">
                            <button className="font-mono underline text-accent">免费试算 (先验后付)</button>
                            <span className="text-white/40">|</span>
                            <span className="font-mono text-white/40">自定义 API</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="w-full h-12 bg-accent hover:bg-accent/90 text-black border-4 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] transition-all font-mono text-base font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        "生成人生K线图"
                      )}
                    </Button>

                    {/* Disclaimer */}
                    <div className="bg-white/5 border-l-4 border-accent p-3">
                      <p className="font-mono text-xs text-white/50 leading-relaxed">
                        ℹ️ 提示：AI模型预测的出生日期由八字生成，计费直至大约前100条人生K线图。
                      </p>
                    </div>

                    {/* Error Display */}
                    {error && (
                      <div className="bg-red-950/50 border-2 border-red-500 p-4">
                        <p className="font-mono text-sm text-red-200">{error}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Features Grid */}
              <div className="grid md:grid-cols-3 gap-4 mt-12 max-w-4xl mx-auto">
                {[
                  {
                    title: "传统命理",
                    subtitle: "TRADITIONAL",
                    desc: "基于千年八字命理学说",
                  },
                  {
                    title: "可视技术",
                    subtitle: "VISUALIZATION",
                    desc: "金融K线图直观展示",
                  },
                  {
                    title: "AI分析",
                    subtitle: "INTELLIGENCE",
                    desc: "智能解读人生转折点",
                  },
                ].map((feature, i) => (
                  <div
                    key={i}
                    className="border-4 border-white p-5 bg-black/80 backdrop-blur-sm hover:bg-black/70 transition-colors group"
                  >
                    <div className="font-mono text-xs tracking-widest text-white/50 mb-2">{feature.subtitle}</div>
                    <h5 className="font-serif text-xl font-bold mb-2 text-white group-hover:text-accent transition-colors">
                      {feature.title}
                    </h5>
                    <p className="font-mono text-sm text-white/60 leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {step === "confirmation" && baziData && (
            <BaziConfirmation
              baziData={baziData}
              birthInfo={{ name, gender, location }}
              onConfirm={handleConfirmBazi}
              onReenter={handleReenter}
              isLoading={loading}
            />
          )}

          {step === "result" && loading && (
            <Card className="max-w-2xl mx-auto border-4 border-white bg-black/90 backdrop-blur-sm p-12 text-center">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-accent" />
              <p className="font-mono text-lg text-white mb-2">正在生成百岁流年走势图...</p>
              <p className="font-mono text-sm text-white/60">请稍候，这可能需要一些时间</p>
            </Card>
          )}
        </motion.div>
      </div>

      {step === "result" && fortuneData && (
        <div className="relative z-10 px-4 pb-20">
          <div className="max-w-7xl mx-auto">
            <FortuneKLineChart data={fortuneData} />
          </div>
        </div>
      )}

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="font-mono text-[10px] tracking-widest text-white/50 uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/50 to-transparent" />
        </motion.div>
      </motion.div>
    </section>
  )
}
