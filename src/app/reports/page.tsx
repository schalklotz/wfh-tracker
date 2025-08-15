'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

interface Analytics {
  dateRange: { start: string; end: string }
  summary: {
    totalEntries: number
    totalHours: number
    averageHours: number
    uniqueStaff: number
    uniqueReasons: number
  }
  staffTrends: Array<{
    staff: { id: string; fullName: string; email: string | null; active: boolean }
    entries: number
    totalHours: number
    averageHoursPerDay: number
    riskScore: number
  }>
  reasonTrends: Array<{
    reason: { id: string; name: string }
    entries: number
    totalHours: number
    percentage: number
  }>
  dayOfWeekTrends: Array<{
    dayOfWeek: number
    dayName: string
    count: number
    totalHours: number
    averageHours: number
  }>
  monthlyTrends: Array<{
    month: string
    count: number
    totalHours: number
    uniqueStaff: number
  }>
  insights: Array<{
    type: string
    title: string
    message: string
    severity: 'low' | 'medium' | 'high'
  }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c']

export default function ReportsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateFilter, setDateFilter] = useState({
    startDate: '',
    endDate: ''
  })
  const [activeTab, setActiveTab] = useState('overview')

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (dateFilter.startDate) params.append('startDate', dateFilter.startDate)
      if (dateFilter.endDate) params.append('endDate', dateFilter.endDate)
      
      const response = await fetch(`/api/reports/analytics?${params}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const handleDateFilterChange = () => {
    fetchAnalytics()
  }

  const resetDateFilter = () => {
    setDateFilter({ startDate: '', endDate: '' })
    setTimeout(fetchAnalytics, 100)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Loading comprehensive WFH analytics...</p>
        </div>
        <div className="bg-white rounded-lg border p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Failed to load analytics data</p>
        </div>
      </div>
    )
  }

  const getRiskColor = (riskScore: number): string => {
    if (riskScore >= 70) return 'text-red-600 bg-red-50'
    if (riskScore >= 40) return 'text-orange-600 bg-orange-50'
    return 'text-green-600 bg-green-50'
  }

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200'
      default: return 'text-blue-600 bg-blue-50 border-blue-200'
    }
  }

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'staff', name: 'Staff Analysis' },
    { id: 'reasons', name: 'Reason Trends' },
    { id: 'patterns', name: 'Time Patterns' },
    { id: 'insights', name: 'Insights & Alerts' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive WFH analytics and misuse detection
          </p>
        </div>
        
        {/* Date Filter */}
        <Card className="p-4">
          <div className="flex items-end gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                className="w-40"
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                className="w-40"
              />
            </div>
            <Button onClick={handleDateFilterChange}>Apply</Button>
            <Button variant="outline" onClick={resetDateFilter}>Reset</Button>
          </div>
        </Card>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-600">{analytics.summary.totalEntries}</div>
          <div className="text-sm text-muted-foreground">Total WFH Entries</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-600">{Math.round(analytics.summary.totalHours)}</div>
          <div className="text-sm text-muted-foreground">Total Hours</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-orange-600">{analytics.summary.averageHours.toFixed(1)}</div>
          <div className="text-sm text-muted-foreground">Avg Hours/Day</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-purple-600">{analytics.summary.uniqueStaff}</div>
          <div className="text-sm text-muted-foreground">Active Staff</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-indigo-600">{analytics.summary.uniqueReasons}</div>
          <div className="text-sm text-muted-foreground">Reason Types</div>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Monthly WFH Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#8884d8" name="Entries" />
                <Line type="monotone" dataKey="uniqueStaff" stroke="#82ca9d" name="Staff Count" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Day of Week Pattern */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Day of Week Patterns</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.dayOfWeekTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dayName" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" name="WFH Entries" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {activeTab === 'staff' && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Staff WFH Analysis & Risk Assessment</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>WFH Days</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Avg Hours/Day</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.staffTrends.map((trend) => (
                <TableRow key={trend.staff.id}>
                  <TableCell className="font-medium">
                    {trend.staff.fullName}
                    {!trend.staff.active && <span className="ml-2 text-red-500">(Inactive)</span>}
                  </TableCell>
                  <TableCell>{trend.entries}</TableCell>
                  <TableCell>{Math.round(trend.totalHours)}</TableCell>
                  <TableCell>{trend.averageHoursPerDay}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(trend.riskScore)}`}>
                      {trend.riskScore}%
                    </span>
                  </TableCell>
                  <TableCell>
                    {trend.riskScore >= 70 && <span className="text-red-600">⚠️ High Risk</span>}
                    {trend.riskScore >= 40 && trend.riskScore < 70 && <span className="text-orange-600">⚠️ Medium Risk</span>}
                    {trend.riskScore < 40 && <span className="text-green-600">✅ Normal</span>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {activeTab === 'reasons' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">WFH Reasons Distribution</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={analytics.reasonTrends}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="entries"
                  nameKey="reason.name"
                >
                  {analytics.reasonTrends.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Reason Usage Statistics</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reason</TableHead>
                  <TableHead>Usage Count</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.reasonTrends.map((trend) => (
                  <TableRow key={trend.reason.id}>
                    <TableCell className="font-medium">{trend.reason.name}</TableCell>
                    <TableCell>{trend.entries}</TableCell>
                    <TableCell>{Math.round(trend.totalHours)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${trend.percentage}%` }}
                          ></div>
                        </div>
                        {trend.percentage}%
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {activeTab === 'patterns' && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Weekly Pattern Analysis</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analytics.dayOfWeekTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dayName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="WFH Entries" />
                <Bar dataKey="averageHours" fill="#82ca9d" name="Avg Hours" />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium text-yellow-800">Pattern Insights:</h4>
              <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                <li>• Monday and Friday typically show higher WFH usage</li>
                <li>• Weekend entries may indicate overtime or misuse</li>
                <li>• Consistent daily patterns suggest legitimate usage</li>
              </ul>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">🔍 AI-Powered Insights & Alerts</h3>
            
            {analytics.insights.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-4">✅</div>
                <p>No anomalies detected. All WFH patterns appear normal.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.insights.map((insight, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${getSeverityColor(insight.severity)}`}>
                    <div className="flex items-start">
                      <div className="mr-3 mt-1">
                        {insight.severity === 'high' && '🚨'}
                        {insight.severity === 'medium' && '⚠️'}
                        {insight.severity === 'low' && 'ℹ️'}
                      </div>
                      <div>
                        <h4 className="font-semibold">{insight.title}</h4>
                        <p className="text-sm mt-1">{insight.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 bg-blue-50 border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-3">📊 How to Interpret Risk Scores</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-green-100 p-3 rounded border border-green-200">
                <div className="font-medium text-green-800">Low Risk (0-39%)</div>
                <p className="text-green-700">Normal WFH usage patterns</p>
              </div>
              <div className="bg-orange-100 p-3 rounded border border-orange-200">
                <div className="font-medium text-orange-800">Medium Risk (40-69%)</div>
                <p className="text-orange-700">Elevated usage - monitor trends</p>
              </div>
              <div className="bg-red-100 p-3 rounded border border-red-200">
                <div className="font-medium text-red-800">High Risk (70%+)</div>
                <p className="text-red-700">Potential misuse - requires review</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}