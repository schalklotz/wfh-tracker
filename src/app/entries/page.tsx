"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Calendar, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, Option } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreateWfhEntrySchema, type CreateWfhEntry } from "@/lib/validations"
import { format } from "date-fns"

type Staff = {
  id: string
  fullName: string
  email: string
}

type Reason = {
  id: string
  name: string
}

type WfhEntry = {
  id: string
  staff: Staff
  reason: Reason | null
  freeTextReason: string | null
  date: string
  hours: number | null
  notes: string | null
  createdAt: string
}

export default function EntriesPage() {
  const [entries, setEntries] = useState<WfhEntry[]>([])
  const [staff, setStaff] = useState<Staff[]>([])
  const [reasons, setReasons] = useState<Reason[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEntry, setEditingEntry] = useState<WfhEntry | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStaff, setSelectedStaff] = useState("")
  const [selectedReason, setSelectedReason] = useState("")
  const [formData, setFormData] = useState<CreateWfhEntry>({
    staffId: "",
    reasonId: "",
    freeTextReason: "",
    date: new Date().toISOString().split('T')[0],
    hours: undefined,
    notes: ""
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [entriesRes, staffRes, reasonsRes] = await Promise.all([
        fetch('/api/entries'),
        fetch('/api/staff'),
        fetch('/api/reasons')
      ])
      
      const [entriesData, staffData, reasonsData] = await Promise.all([
        entriesRes.json(),
        staffRes.json(),
        reasonsRes.json()
      ])

      setEntries(entriesData)
      setStaff(staffData)
      setReasons(reasonsData)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    try {
      const validatedData = CreateWfhEntrySchema.parse({
        ...formData,
        hours: formData.hours ? Number(formData.hours) : undefined
      })

      const url = editingEntry ? `/api/entries/${editingEntry.id}` : '/api/entries'
      const method = editingEntry ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData)
      })

      if (response.ok) {
        await fetchData()
        resetForm()
      } else {
        throw new Error('Failed to save entry')
      }
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message
        })
        setErrors(newErrors)
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      try {
        const response = await fetch(`/api/entries/${id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          await fetchData()
        }
      } catch (error) {
        console.error('Failed to delete entry:', error)
      }
    }
  }

  const handleEdit = (entry: WfhEntry) => {
    setEditingEntry(entry)
    setFormData({
      staffId: entry.staff.id,
      reasonId: entry.reason?.id || "",
      freeTextReason: entry.freeTextReason || "",
      date: entry.date.split('T')[0],
      hours: entry.hours || undefined,
      notes: entry.notes || ""
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      staffId: "",
      reasonId: "",
      freeTextReason: "",
      date: new Date().toISOString().split('T')[0],
      hours: undefined,
      notes: ""
    })
    setEditingEntry(null)
    setShowForm(false)
    setErrors({})
  }

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.staff.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.reason?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.freeTextReason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStaff = !selectedStaff || entry.staff.id === selectedStaff
    const matchesReason = !selectedReason || entry.reason?.id === selectedReason
    
    return matchesSearch && matchesStaff && matchesReason
  })

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">WFH Entries</h1>
          <p className="text-muted-foreground">
            Manage work from home entries
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Entry
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingEntry ? 'Edit Entry' : 'Add New Entry'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="staffId">Staff Member *</Label>
                  <Select 
                    value={formData.staffId} 
                    onChange={(e) => setFormData({...formData, staffId: e.target.value})}
                    placeholder="Select staff member"
                  >
                    <Option value="">Select staff member</Option>
                    {staff.map((member) => (
                      <Option key={member.id} value={member.id}>
                        {member.fullName}
                      </Option>
                    ))}
                  </Select>
                  {errors.staffId && <p className="text-sm text-red-500 mt-1">{errors.staffId}</p>}
                </div>

                <div>
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                  {errors.date && <p className="text-sm text-red-500 mt-1">{errors.date}</p>}
                </div>

                <div>
                  <Label htmlFor="reasonId">Reason</Label>
                  <Select 
                    value={formData.reasonId} 
                    onChange={(e) => setFormData({...formData, reasonId: e.target.value})}
                    placeholder="Select reason"
                  >
                    <Option value="">Select reason</Option>
                    {reasons.map((reason) => (
                      <Option key={reason.id} value={reason.id}>
                        {reason.name}
                      </Option>
                    ))}
                  </Select>
                  {errors.reasonId && <p className="text-sm text-red-500 mt-1">{errors.reasonId}</p>}
                </div>

                <div>
                  <Label htmlFor="hours">Hours (optional)</Label>
                  <Input
                    id="hours"
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={formData.hours || ""}
                    onChange={(e) => setFormData({...formData, hours: e.target.value ? Number(e.target.value) : undefined})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="freeTextReason">Free Text Reason</Label>
                <Input
                  id="freeTextReason"
                  placeholder="Enter custom reason if not selected above"
                  value={formData.freeTextReason}
                  onChange={(e) => setFormData({...formData, freeTextReason: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  {editingEntry ? 'Update Entry' : 'Add Entry'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select 
              value={selectedStaff} 
              onChange={(e) => setSelectedStaff(e.target.value)}
              className="w-full md:w-48"
              placeholder="Filter by staff"
            >
              <Option value="">All Staff</Option>
              {staff.map((member) => (
                <Option key={member.id} value={member.id}>
                  {member.fullName}
                </Option>
              ))}
            </Select>
            <Select 
              value={selectedReason} 
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full md:w-48"
              placeholder="Filter by reason"
            >
              <Option value="">All Reasons</Option>
              {reasons.map((reason) => (
                <Option key={reason.id} value={reason.id}>
                  {reason.name}
                </Option>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Entries ({filteredEntries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">
                    {entry.staff.fullName}
                  </TableCell>
                  <TableCell>
                    {format(new Date(entry.date), 'dd MMM yyyy')}
                  </TableCell>
                  <TableCell>
                    {entry.reason ? entry.reason.name : entry.freeTextReason}
                  </TableCell>
                  <TableCell>
                    {entry.hours ? `${entry.hours}h` : '-'}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {entry.notes || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(entry)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredEntries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No entries found. {searchTerm || selectedStaff || selectedReason ? 'Try adjusting your filters.' : 'Add your first entry to get started.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}