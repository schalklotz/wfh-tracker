import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"

export async function RecentEntries() {
  const entries = await prisma.wfhEntry.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      staff: true,
      reason: true
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Entries</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No entries found</p>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between border-b pb-2 last:border-b-0">
                <div>
                  <p className="font-medium">{entry.staff.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {entry.reason?.name || entry.freeTextReason}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatDate(entry.date)}</p>
                  {entry.hours && (
                    <p className="text-sm text-muted-foreground">{entry.hours}h</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}