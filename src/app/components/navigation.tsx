import Link from "next/link"
import { Home, FileText, BarChart3, Users, Settings } from "lucide-react"

export function Navigation() {
  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Home className="h-6 w-6" />
              <span className="text-xl font-bold">WFH Tracker</span>
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-sm hover:text-primary"
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link 
                href="/entries" 
                className="flex items-center space-x-2 text-sm hover:text-primary"
              >
                <FileText className="h-4 w-4" />
                <span>Entries</span>
              </Link>
              <Link 
                href="/reports" 
                className="flex items-center space-x-2 text-sm hover:text-primary"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Reports</span>
              </Link>
              <Link 
                href="/admin/staff" 
                className="flex items-center space-x-2 text-sm hover:text-primary"
              >
                <Users className="h-4 w-4" />
                <span>Staff</span>
              </Link>
              <Link 
                href="/admin/reasons" 
                className="flex items-center space-x-2 text-sm hover:text-primary"
              >
                <Settings className="h-4 w-4" />
                <span>Reasons</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Development Mode
            </span>
          </div>
        </div>
      </div>
    </nav>
  )
}