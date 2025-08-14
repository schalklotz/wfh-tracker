import { Suspense } from "react"
import { DashboardStats } from "./components/dashboard-stats"
import { RecentEntries } from "./components/recent-entries"
import { QuickAddEntry } from "./components/quick-add-entry"

export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of work from home activities and quick actions
        </p>
      </div>

      <Suspense fallback={<div>Loading stats...</div>}>
        <DashboardStats />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<div>Loading recent entries...</div>}>
          <RecentEntries />
        </Suspense>
        
        <QuickAddEntry />
      </div>
    </div>
  )
}
