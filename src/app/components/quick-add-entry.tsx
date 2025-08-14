"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function QuickAddEntry() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleQuickAdd = () => {
    router.push('/entries?new=true')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Quick Add Entry</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Add a new work from home entry quickly
          </p>
          <Button 
            onClick={handleQuickAdd}
            className="w-full"
            disabled={isLoading}
          >
            Add New Entry
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}