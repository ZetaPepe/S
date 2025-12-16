import { NextResponse } from "next/server"

const systemMessage = {
  role: "system" as const,
  content: `你是一位精通中国传统八字命理的大师。你的任务是根据用户提供的出生信息计算八字排盘。

请严格按照以下JSON格式返回（不要添加任何markdown代码块标记）：
{
  "gregorianDate": "公历日期，格式：1990年1月1日 0:00",
  "lunarDate": "农历日期，格式：1989年12月5日",
  "solarTime": "真太阳时，格式：23:46 (时差：子时)",
  "pillars": {
    "year": "年柱，例如：己巳",
    "month": "月柱，例如：丙子",
    "day": "日柱，例如：癸寅",
    "hour": "时柱，例如：庚子"
  },
  "majorLuck": {
    "startAge": 9,
    "direction": "逆行",
    "periods": ["乙亥", "甲戌", "癸酉", "壬申", "辛未", "庚午", "己巳", "戊辰", "丁卯"]
  }
}`,
}

export async function POST(request: Request) {
  try {
    const { birthInfo } = await request.json()

    if (!birthInfo) {
      return NextResponse.json({ error: "Birth information is required" }, { status: 400 })
    }

    const openaiApiKey = process.env.OPENAI_API_KEY

    if (!openaiApiKey) {
      return NextResponse.json(
        {
          error: "OpenAI API key not configured",
          success: false,
        },
        { status: 500 },
      )
    }

    const userMessage = {
      role: "user" as const,
      content: `请为以下出生信息进行八字排盘：

出生日期：${birthInfo.year}年${birthInfo.month}月${birthInfo.day}日
出生时间：${birthInfo.hour}时${birthInfo.minute}分
性别：${birthInfo.gender === "male" ? "男" : "女"}
${birthInfo.location ? `出生地点：${birthInfo.location}` : ""}

请计算公历、农历、真太阳时、四柱八字和大运信息。`,
    }

    const response = await fetch("https://api.nuwaapi.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [systemMessage, userMessage],
        max_tokens: 2000,
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        {
          error: `API错误: ${response.status}`,
          success: false,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    const baziData = JSON.parse(data.choices[0].message.content)

    return NextResponse.json({
      baziData,
      success: true,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "处理请求失败",
        success: false,
      },
      { status: 500 },
    )
  }
}
