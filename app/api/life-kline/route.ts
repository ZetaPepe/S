import { NextResponse } from "next/server"

const systemMessage = {
  role: "system" as const,
  content: `你是一位精通中国传统八字命理的大师。你的任务是：

1. 根据用户提供的出生信息（年月日时、性别、出生地），分析其八字命理
2. 为该用户生成11个关键年龄点的流年运势数据：0、10、20、30、40、50、60、70、80、90、100岁
3. 以JSON格式返回数据，包括每个年龄点的：
   - 年龄（age）
   - 总运势评分（0-100）
   - 财运评分（0-100）
   - 事业评分（0-100）
   - 该年份的天干地支
   - 运势趋势（上升、下降、平稳）
   - 该年的关键事件或建议（简短，20字以内）

请严格按照以下JSON格式返回（不要添加任何markdown代码块标记）：
{
  "bazi": "八字命盘信息（简短）",
  "summary": "整体命理分析摘要（50字以内）",
  "yearlyData": [
    {
      "age": 0,
      "year": "甲寅",
      "overall": 75,
      "wealth": 70,
      "career": 65,
      "trend": "上升",
      "keyEvents": "关键事件（20字以内）"
    }
  ],
  "lifePhases": {
    "childhood": "童年运势总结（30字以内）",
    "youth": "青年运势总结（30字以内）",
    "middleAge": "中年运势总结（30字以内）",
    "oldAge": "老年运势总结（30字以内）"
  },
  "criticalPoints": [
    {
      "age": 25,
      "description": "转折点描述（30字以内）"
    }
  ]
}

重要：只生成11个数据点（0、10、20、30、40、50、60、70、80、90、100岁），所有描述都要简短。`,
}

export async function POST(request: Request) {
  try {
    const { birthInfo } = await request.json()

    if (!birthInfo) {
      return NextResponse.json({ error: "Birth information is required" }, { status: 400 })
    }

    const openaiApiKey = process.env.OPENAI_API_KEY

    if (!openaiApiKey) {
      console.error("OpenAI API key not found in environment variables")
      return NextResponse.json(
        {
          error: "OpenAI API key not configured. Please add your API key to environment variables.",
          success: false,
          errorType: "missing_key",
        },
        { status: 500 },
      )
    }

    if (!openaiApiKey.startsWith("sk-") || openaiApiKey.length < 20) {
      console.error("Invalid OpenAI API key format")
      return NextResponse.json(
        {
          error: "Invalid OpenAI API key format. Please check your API key.",
          success: false,
          errorType: "invalid_format",
        },
        { status: 500 },
      )
    }

    console.log("Making request to OpenAI API for 11-point Life K-Line analysis...")

    const userMessage = {
      role: "user" as const,
      content: `请为以下出生信息进行八字命理分析，生成11个年龄点（0、10、20、30、40、50、60、70、80、90、100岁）的流年运势数据：

出生日期：${birthInfo.year}年${birthInfo.month}月${birthInfo.day}日
出生时间：${birthInfo.hour}时${birthInfo.minute}分
性别：${birthInfo.gender === "male" ? "男" : "女"}
${birthInfo.location ? `出生地点：${birthInfo.location}` : ""}
${birthInfo.name ? `姓名：${birthInfo.name}` : ""}

请只生成11个数据点，所有描述保持简短。`,
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
        max_tokens: 4000, // Reduced from 16000 to 4000 for faster generation
        temperature: 0.8,
        response_format: { type: "json_object" },
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("OpenAI API Error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      })

      if (response.status === 401) {
        const errorMessage = errorData?.error?.message || ""

        if (errorMessage.includes("account_deactivated") || errorMessage.includes("deactivated")) {
          return NextResponse.json(
            {
              error:
                "Your OpenAI account has been deactivated. Please check your email from OpenAI for more information.",
              success: false,
              errorType: "account_deactivated",
            },
            { status: 401 },
          )
        } else if (errorMessage.includes("insufficient_quota") || errorMessage.includes("quota")) {
          return NextResponse.json(
            {
              error: "Your OpenAI account has exceeded its quota. Please add billing information.",
              success: false,
              errorType: "quota_exceeded",
            },
            { status: 401 },
          )
        } else {
          return NextResponse.json(
            {
              error: "Invalid OpenAI API key. Please check your API key configuration.",
              success: false,
              errorType: "invalid_key",
            },
            { status: 401 },
          )
        }
      } else if (response.status === 429) {
        return NextResponse.json(
          {
            error: "Rate limit exceeded. Please try again in a moment.",
            success: false,
            errorType: "rate_limit",
          },
          { status: 429 },
        )
      } else if (response.status === 403) {
        return NextResponse.json(
          {
            error: "Access denied. Please check your OpenAI account status and billing.",
            success: false,
            errorType: "access_denied",
          },
          { status: 403 },
        )
      } else {
        return NextResponse.json(
          {
            error: `OpenAI API error: ${response.status}. Please try again later.`,
            success: false,
            errorType: "api_error",
          },
          { status: 500 },
        )
      }
    }

    const data = await response.json()

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("Invalid response structure from OpenAI:", data)
      return NextResponse.json(
        {
          error: "Invalid response from AI service",
          success: false,
          errorType: "invalid_response",
        },
        { status: 500 },
      )
    }

    const assistantMessage = data.choices[0].message

    let fortuneData
    try {
      fortuneData = JSON.parse(assistantMessage.content)
      if (!fortuneData.yearlyData || !Array.isArray(fortuneData.yearlyData)) {
        throw new Error("Invalid data structure")
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      return NextResponse.json(
        {
          error: "Failed to parse fortune analysis data",
          success: false,
          errorType: "parse_error",
        },
        { status: 500 },
      )
    }

    console.log("OpenAI API call successful for 11-point Life K-Line analysis")

    return NextResponse.json({
      fortuneData,
      success: true,
      usage: data.usage,
    })
  } catch (error: any) {
    console.error("Error in Life K-Line API:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to process request. Please try again.",
        success: false,
        errorType: "network_error",
      },
      { status: 500 },
    )
  }
}
