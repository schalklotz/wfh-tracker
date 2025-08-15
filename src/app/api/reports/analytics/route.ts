import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') 
    const endDate = searchParams.get('endDate')

    // Default to last 3 months if no dates provided
    const defaultStartDate = new Date()
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 3)
    
    const dateFilter = {
      date: {
        gte: startDate ? new Date(startDate) : defaultStartDate,
        lte: endDate ? new Date(endDate) : new Date()
      }
    }

    // Parallel queries for performance
    const [
      staffTrends,
      reasonTrends, 
      dayOfWeekTrends,
      monthlyTrends,
      topUsers,
      recentEntries,
      totalStats
    ] = await Promise.all([
      // Staff trends with potential misuse indicators
      prisma.wfhEntry.groupBy({
        by: ['staffId'],
        where: dateFilter,
        _count: { id: true },
        _sum: { hours: true },
        orderBy: { _count: { id: 'desc' } }
      }),

      // Reason usage patterns
      prisma.wfhEntry.groupBy({
        by: ['reasonId'],
        where: dateFilter,
        _count: { id: true },
        _sum: { hours: true },
        orderBy: { _count: { id: 'desc' } }
      }),

      // Day of week analysis
      prisma.$queryRaw`
        SELECT 
          CAST(strftime('%w', datetime(date/1000, 'unixepoch')) AS INTEGER) as dayOfWeek,
          CAST(COUNT(*) AS INTEGER) as count,
          CAST(SUM(COALESCE(hours, 8)) AS REAL) as totalHours,
          CAST(AVG(COALESCE(hours, 8)) AS REAL) as avgHours
        FROM WfhEntry 
        WHERE datetime(date/1000, 'unixepoch') >= datetime(${Math.floor(dateFilter.date.gte.getTime()/1000)}, 'unixepoch') 
          AND datetime(date/1000, 'unixepoch') <= datetime(${Math.floor(dateFilter.date.lte.getTime()/1000)}, 'unixepoch')
        GROUP BY strftime('%w', datetime(date/1000, 'unixepoch'))
        ORDER BY dayOfWeek
      `,

      // Monthly trends
      prisma.$queryRaw`
        SELECT 
          strftime('%Y-%m', datetime(date/1000, 'unixepoch')) as month,
          CAST(COUNT(*) AS INTEGER) as count,
          CAST(SUM(COALESCE(hours, 8)) AS REAL) as totalHours,
          CAST(COUNT(DISTINCT staffId) AS INTEGER) as uniqueStaff
        FROM WfhEntry 
        WHERE datetime(date/1000, 'unixepoch') >= datetime(${Math.floor(dateFilter.date.gte.getTime()/1000)}, 'unixepoch') 
          AND datetime(date/1000, 'unixepoch') <= datetime(${Math.floor(dateFilter.date.lte.getTime()/1000)}, 'unixepoch')
        GROUP BY strftime('%Y-%m', datetime(date/1000, 'unixepoch'))
        ORDER BY month ASC
        LIMIT 12
      `,

      // Top WFH users (potential misuse detection)
      prisma.wfhEntry.groupBy({
        by: ['staffId'],
        where: dateFilter,
        _count: { id: true },
        _sum: { hours: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10
      }),

      // Recent entries for pattern analysis
      prisma.wfhEntry.findMany({
        where: dateFilter,
        include: {
          staff: { select: { fullName: true, id: true } },
          reason: { select: { name: true, id: true } }
        },
        orderBy: { date: 'desc' },
        take: 100
      }),

      // Total statistics
      prisma.wfhEntry.aggregate({
        where: dateFilter,
        _count: { id: true },
        _sum: { hours: true },
        _avg: { hours: true }
      })
    ])

    // Get staff details for trends
    const staffIds = staffTrends.map(s => s.staffId)
    const staffDetails = await prisma.staff.findMany({
      where: { id: { in: staffIds } },
      select: { id: true, fullName: true, email: true, active: true }
    })

    // Get reason details for trends
    const reasonIds = reasonTrends.map(r => r.reasonId).filter(Boolean) as string[]
    const reasonDetails = await prisma.reason.findMany({
      where: { id: { in: reasonIds } },
      select: { id: true, name: true }
    })

    // Calculate insights and potential misuse indicators
    const insights = calculateInsights(staffTrends, reasonTrends, dayOfWeekTrends, recentEntries, totalStats)

    // Transform data for frontend consumption
    const analytics = {
      dateRange: {
        start: dateFilter.date.gte,
        end: dateFilter.date.lte
      },
      summary: {
        totalEntries: totalStats._count.id,
        totalHours: totalStats._sum.hours || 0,
        averageHours: totalStats._avg.hours || 0,
        uniqueStaff: new Set(staffTrends.map(s => s.staffId)).size,
        uniqueReasons: new Set(reasonTrends.map(r => r.reasonId)).size
      },
      staffTrends: staffTrends.map(trend => {
        const staff = staffDetails.find(s => s.id === trend.staffId)
        const avgHoursPerDay = (trend._sum.hours || trend._count.id * 8) / trend._count.id
        return {
          staff: staff || { id: trend.staffId, fullName: 'Unknown', email: null, active: false },
          entries: trend._count.id,
          totalHours: trend._sum.hours || trend._count.id * 8,
          averageHoursPerDay: Math.round(avgHoursPerDay * 10) / 10,
          riskScore: calculateRiskScore(trend._count.id, avgHoursPerDay, totalStats._count.id)
        }
      }),
      reasonTrends: reasonTrends.map(trend => {
        const reason = reasonDetails.find(r => r.id === trend.reasonId) || 
                      { id: 'freetext', name: 'Free Text Reasons' }
        return {
          reason,
          entries: trend._count.id,
          totalHours: trend._sum.hours || trend._count.id * 8,
          percentage: Math.round((trend._count.id / totalStats._count.id) * 100)
        }
      }),
      dayOfWeekTrends: (dayOfWeekTrends as any[]).map(day => ({
        dayOfWeek: typeof day.dayOfWeek === 'bigint' ? Number(day.dayOfWeek) : Number(day.dayOfWeek),
        dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][typeof day.dayOfWeek === 'bigint' ? Number(day.dayOfWeek) : Number(day.dayOfWeek)],
        count: typeof day.count === 'bigint' ? Number(day.count) : Number(day.count),
        totalHours: typeof day.totalHours === 'bigint' ? Number(day.totalHours) : Number(day.totalHours) || 0,
        averageHours: Math.round((typeof day.avgHours === 'bigint' ? Number(day.avgHours) : Number(day.avgHours)) * 10) / 10 || 0
      })),
      monthlyTrends: (monthlyTrends as any[]).map(month => ({
        month: month.month,
        count: typeof month.count === 'bigint' ? Number(month.count) : Number(month.count),
        totalHours: typeof month.totalHours === 'bigint' ? Number(month.totalHours) : Number(month.totalHours) || 0,
        uniqueStaff: typeof month.uniqueStaff === 'bigint' ? Number(month.uniqueStaff) : Number(month.uniqueStaff)
      })),
      insights
    }

    return NextResponse.json(analytics)
    
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: "Failed to generate analytics" },
      { status: 500 }
    )
  }
}

function calculateRiskScore(entries: number, avgHours: number, totalEntries: number): number {
  // Risk scoring algorithm to identify potential misuse
  let risk = 0
  
  // High frequency risk (more than 20% of total entries for one person)
  if (entries / totalEntries > 0.2) risk += 30
  else if (entries / totalEntries > 0.15) risk += 20
  else if (entries / totalEntries > 0.1) risk += 10
  
  // Unusual hours risk (significantly different from 8-hour average)
  if (avgHours > 10 || avgHours < 4) risk += 25
  else if (avgHours > 9 || avgHours < 6) risk += 15
  
  // High absolute frequency risk
  if (entries > 30) risk += 20
  else if (entries > 20) risk += 10
  
  return Math.min(risk, 100) // Cap at 100%
}

function calculateInsights(staffTrends: any[], reasonTrends: any[], dayTrends: any[], recentEntries: any[], totalStats: any) {
  const insights = []
  
  // Most active WFH user
  if (staffTrends.length > 0) {
    const topUser = staffTrends[0]
    const percentage = Math.round((topUser._count.id / totalStats._count.id) * 100)
    insights.push({
      type: 'info',
      title: 'Most Active WFH User',
      message: `Highest WFH usage represents ${percentage}% of all entries`,
      severity: percentage > 25 ? 'high' : percentage > 15 ? 'medium' : 'low'
    })
  }
  
  // Day of week patterns
  const weekdayPattern = (dayTrends as any[]).find((d: any) => ['1', '2', '3', '4', '5'].includes(d.dayOfWeek))
  const weekendPattern = (dayTrends as any[]).find((d: any) => ['0', '6'].includes(d.dayOfWeek))
  
  if (weekendPattern && weekendPattern.count > 0) {
    insights.push({
      type: 'warning', 
      title: 'Weekend WFH Activity',
      message: `${weekendPattern.count} WFH entries logged on weekends - verify if legitimate`,
      severity: 'medium'
    })
  }
  
  // Reason usage patterns
  if (reasonTrends.length > 0) {
    const topReason = reasonTrends[0]
    const percentage = Math.round((topReason._count.id / totalStats._count.id) * 100)
    insights.push({
      type: 'info',
      title: 'Most Common WFH Reason',
      message: `Top reason accounts for ${percentage}% of all WFH requests`,
      severity: percentage > 40 ? 'medium' : 'low'
    })
  }
  
  // Consecutive days analysis
  const consecutiveDays = findConsecutiveDays(recentEntries)
  if (consecutiveDays.maxConsecutive > 5) {
    insights.push({
      type: 'warning',
      title: 'Extended WFH Periods',
      message: `Found ${consecutiveDays.maxConsecutive} consecutive WFH days - review for legitimacy`,
      severity: consecutiveDays.maxConsecutive > 10 ? 'high' : 'medium'
    })
  }
  
  return insights
}

function findConsecutiveDays(entries: any[]): { maxConsecutive: number, details: any[] } {
  const staffDays: Record<string, string[]> = {}
  
  // Group entries by staff member
  entries.forEach(entry => {
    if (!staffDays[entry.staffId]) staffDays[entry.staffId] = []
    staffDays[entry.staffId].push(entry.date)
  })
  
  let maxConsecutive = 0
  const details: any[] = []
  
  // Check consecutive days for each staff member
  Object.entries(staffDays).forEach(([staffId, dates]) => {
    const sortedDates = dates.sort()
    let consecutive = 1
    let currentStreak = 1
    
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1])
      const currDate = new Date(sortedDates[i])
      const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      
      if (diffDays === 1) {
        currentStreak++
        consecutive = Math.max(consecutive, currentStreak)
      } else {
        currentStreak = 1
      }
    }
    
    if (consecutive > maxConsecutive) {
      maxConsecutive = consecutive
    }
    
    if (consecutive > 3) {
      const staff = entries.find(e => e.staffId === staffId)?.staff
      details.push({
        staff: staff?.fullName || 'Unknown',
        consecutiveDays: consecutive,
        staffId
      })
    }
  })
  
  return { maxConsecutive, details }
}