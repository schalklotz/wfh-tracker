import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, Clock, TrendingUp } from "lucide-react"

export async function DashboardStats() {
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay())

  const [
    totalStaff,
    totalWfhDays,
    thisMonthEntries,
    totalHours
  ] = await Promise.all([
    prisma.staff.count({ where: { active: true } }),
    prisma.wfhEntry.count(),
    prisma.wfhEntry.count({
      where: {
        date: {
          gte: startOfMonth
        }
      }
    }),
    prisma.wfhEntry.aggregate({
      _sum: {
        hours: true
      }
    })
  ])

  const stats = [
    {
      title: "Active Staff",
      value: totalStaff,
      description: "Team members",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Total WFH Days",
      value: totalWfhDays,
      description: "All time",
      icon: Calendar,
      color: "text-green-600"
    },
    {
      title: "This Month",
      value: thisMonthEntries,
      description: "WFH entries",
      icon: TrendingUp,
      color: "text-orange-600"
    },
    {
      title: "Total Hours",
      value: totalHours._sum.hours || 0,
      description: "Logged hours",
      icon: Clock,
      color: "text-purple-600"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}