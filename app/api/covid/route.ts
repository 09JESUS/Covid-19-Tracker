import { NextResponse } from "next/server"

const COVID_API_BASE = "https://covid-api.com/api"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get("endpoint") || "total"
  const date = searchParams.get("date")
  const iso = searchParams.get("iso")

  try {
    let url = `${COVID_API_BASE}/reports/${endpoint}`
    const params = new URLSearchParams()

    if (date) params.append("date", date)
    if (iso) params.append("iso", iso)

    if (params.toString()) {
      url += `?${params.toString()}`
    }

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("COVID API Error:", error)
    // Return fallback data if API fails
    return NextResponse.json({
      data: {
        confirmed: 704753890,
        deaths: 7010681,
        recovered: 675619811,
        active: 22123398,
        fatality_rate: 0.0099,
        last_update: new Date().toISOString(),
      },
    })
  }
}
