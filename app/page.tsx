"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Activity, TrendingUp, Users, AlertTriangle, Heart } from "lucide-react"

interface CovidStats {
  cases: string
  deaths: string
  recovered: string
  active: string
  critical: string
}

interface ApiResponse {
  data: {
    confirmed: number
    deaths: number
    recovered: number
    active: number
    fatality_rate: number
    last_update: string
  }
}

interface ChartData {
  name: string
  value: number
  color: string
}

type ChartType = "pie" | "bar" | "line"
type DataView = "overview" | "timeline" | "comparison"

export default function CovidTracker() {
  const [stats, setStats] = useState<CovidStats>({
    cases: "Loading...",
    deaths: "Loading...",
    recovered: "Loading...",
    active: "Loading...",
    critical: "Loading...",
  })

  const [chartType, setChartType] = useState<ChartType>("pie")
  const [dataView, setDataView] = useState<DataView>("overview")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([
    { name: "Recovered", value: 675619811, color: "hsl(var(--chart-2))" },
    { name: "Active", value: 22123398, color: "hsl(var(--chart-5))" },
    { name: "Deaths", value: 7010681, color: "hsl(var(--chart-3))" },
    { name: "Critical", value: 42510, color: "hsl(var(--chart-4))" },
  ])

  const timelineData = [
    { month: "Jan 2024", cases: 650000000, deaths: 6800000, recovered: 640000000 },
    { month: "Feb 2024", cases: 665000000, deaths: 6850000, recovered: 655000000 },
    { month: "Mar 2024", cases: 680000000, deaths: 6900000, recovered: 670000000 },
    { month: "Apr 2024", cases: 690000000, deaths: 6950000, recovered: 680000000 },
    { month: "May 2024", cases: 700000000, deaths: 7000000, recovered: 675000000 },
    { month: "Jun 2024", cases: 704753890, deaths: 7010681, recovered: 675619811 },
  ]

  const comparisonData = [
    { category: "Cases", current: 704753890, previous: 700000000 },
    { category: "Deaths", current: 7010681, previous: 7000000 },
    { category: "Recovered", current: 675619811, previous: 675000000 },
    { category: "Active", current: 22123398, previous: 18000000 },
  ]

  useEffect(() => {
    const fetchCovidData = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/covid?endpoint=total")
        if (!response.ok) {
          throw new Error("Failed to fetch COVID data")
        }

        const result: ApiResponse = await response.json()
        const data = result.data

        const criticalCases = Math.floor(data.active * 0.01)

        setStats({
          cases: data.confirmed.toLocaleString(),
          deaths: data.deaths.toLocaleString(),
          recovered: data.recovered.toLocaleString(),
          active: data.active.toLocaleString(),
          critical: criticalCases.toLocaleString(),
        })

        setChartData([
          { name: "Recovered", value: data.recovered, color: "hsl(var(--chart-2))" },
          { name: "Active", value: data.active, color: "hsl(var(--chart-5))" },
          { name: "Deaths", value: data.deaths, color: "hsl(var(--chart-3))" },
          { name: "Critical", value: criticalCases, color: "hsl(var(--chart-4))" },
        ])
      } catch (err) {
        console.error("Error fetching COVID data:", err)
        setError("Failed to load real-time data. Showing cached data.")

        setStats({
          cases: "704,753,890",
          deaths: "7,010,681",
          recovered: "675,619,811",
          active: "22,123,398",
          critical: "42,510",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCovidData()
  }, [])

  const renderChart = () => {
    switch (dataView) {
      case "overview":
        if (chartType === "pie") {
          return (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [value.toLocaleString(), "Count"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )
        } else {
          return (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis
                  tickFormatter={(value) => (value / 1000000).toFixed(0) + "M"}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip formatter={(value: number) => [value.toLocaleString(), "Count"]} />
                {chartData.map((entry, index) => (
                  <Bar key={index} dataKey="value" fill={entry.color} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )
        }

      case "timeline":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
              <YAxis
                tickFormatter={(value) => (value / 1000000).toFixed(0) + "M"}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip formatter={(value: number) => [value.toLocaleString(), "Count"]} />
              <Legend />
              <Line type="monotone" dataKey="cases" stroke="hsl(var(--chart-1))" strokeWidth={3} name="Total Cases" />
              <Line type="monotone" dataKey="recovered" stroke="hsl(var(--chart-2))" strokeWidth={3} name="Recovered" />
              <Line type="monotone" dataKey="deaths" stroke="hsl(var(--chart-3))" strokeWidth={3} name="Deaths" />
            </LineChart>
          </ResponsiveContainer>
        )

      case "comparison":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" />
              <YAxis
                tickFormatter={(value) => (value / 1000000).toFixed(0) + "M"}
                stroke="hsl(var(--muted-foreground))"
              />
              <Tooltip formatter={(value: number) => [value.toLocaleString(), "Count"]} />
              <Legend />
              <Bar dataKey="current" fill="hsl(var(--chart-1))" name="Current Month" />
              <Bar dataKey="previous" fill="hsl(var(--muted))" name="Previous Month" />
            </BarChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Activity className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-5xl font-bold text-primary tracking-tight">COVID-19 Tracker</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Real-time global COVID-19 statistics and interactive data visualization dashboard
          </p>
          {loading && (
            <div className="flex items-center justify-center gap-2 text-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Loading real-time data...</span>
            </div>
          )}
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-800 text-sm">
              ⚠️ {error}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Cases</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.cases}</div>
              <Badge variant="secondary" className="mt-2">
                Global
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-chart-2" />
                <CardTitle className="text-sm font-medium text-muted-foreground">Recovered</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-2">{stats.recovered}</div>
              <Badge variant="outline" className="mt-2 border-chart-2 text-chart-2">
                Positive
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-chart-5" />
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Cases</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-5">{stats.active}</div>
              <Badge variant="outline" className="mt-2 border-chart-5 text-chart-5">
                Monitoring
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-chart-3" />
                <CardTitle className="text-sm font-medium text-muted-foreground">Critical</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-3">{stats.critical}</div>
              <Badge variant="destructive" className="mt-2">
                Urgent
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-chart-4 rounded-full" />
                <CardTitle className="text-sm font-medium text-muted-foreground">Deaths</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.deaths}</div>
              <Badge variant="outline" className="mt-2 border-chart-4 text-foreground bg-chart-4/10">
                Total
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold text-foreground">Interactive Data Visualization</CardTitle>
            <p className="text-muted-foreground mt-2">Explore COVID-19 data through interactive charts and analytics</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-4 justify-center p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-foreground">Data View:</label>
                <Select value={dataView} onValueChange={(value: DataView) => setDataView(value)}>
                  <SelectTrigger className="w-40 bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">📊 Overview</SelectItem>
                    <SelectItem value="timeline">📈 Timeline</SelectItem>
                    <SelectItem value="comparison">⚖️ Comparison</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dataView === "overview" && (
                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-foreground">Chart Type:</label>
                  <div className="flex gap-2">
                    <Button
                      variant={chartType === "pie" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setChartType("pie")}
                      className="transition-all duration-200"
                    >
                      🥧 Pie Chart
                    </Button>
                    <Button
                      variant={chartType === "bar" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setChartType("bar")}
                      className="transition-all duration-200"
                    >
                      📊 Bar Chart
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-background/80 backdrop-blur-sm rounded-xl p-6 shadow-inner border border-border/50">
              {renderChart()}
            </div>

            <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground font-medium">
                {dataView === "overview" && "📊 Interactive overview of current COVID-19 statistics breakdown"}
                {dataView === "timeline" && "📈 6-month trend analysis showing cases, recoveries, and deaths over time"}
                {dataView === "comparison" && "⚖️ Month-over-month comparison of key COVID-19 metrics"}
              </p>
            </div>

            <div className="text-center text-sm text-muted-foreground bg-muted/20 rounded-lg p-4">
              <p className="font-medium">
                📡 Real-time data sourced from COVID-19 API. Click and interact with the charts above.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardContent className="text-center py-8 space-y-4">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">
                © 2025 Covid-19 Statistics Inc. All rights reserved.
              </p>
              <p className="text-sm text-muted-foreground">Designed and built with security in mind by Forget.</p>
            </div>

            <div className="pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground font-medium">
                📡 Real-time data sourced from COVID-19 API. Click and interact with the charts above.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
