"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card } from "@/components/ui/card"

const data = [
  {
    name: "Jan",
    sms: 2400,
    email: 1400,
  },
  {
    name: "Feb",
    sms: 1398,
    email: 2210,
  },
  {
    name: "Mar",
    sms: 9800,
    email: 2290,
  },
  {
    name: "Apr",
    sms: 3908,
    email: 2000,
  },
  {
    name: "May",
    sms: 4800,
    email: 2181,
  },
  {
    name: "Jun",
    sms: 3800,
    email: 2500,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="email"
          stroke="#8884d8"
          strokeWidth={2}
          name="Email"
        />
        <Line
          type="monotone"
          dataKey="sms"
          stroke="#82ca9d"
          strokeWidth={2}
          name="SMS"
        />
      </LineChart>
    </ResponsiveContainer>
  )
} 