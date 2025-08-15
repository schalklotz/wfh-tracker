'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Select, Option } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Reason {
  id: string
  name: string
  isActive: boolean
  createdAt: string
  _count?: {
    entries: number
  }
}

interface ReasonFormData {
  name: string
  isActive: boolean
}

export default function AdminReasonsPage() {
  const [reasons, setReasons] = useState<Reason[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingReason, setEditingReason] = useState<Reason | null>(null)
  const [formData, setFormData] = useState<ReasonFormData>({
    name: '',
    isActive: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch reasons data
  const fetchReasons = async () => {
    try {
      const response = await fetch('/api/reasons?includeAll=true')
      if (response.ok) {
        const data = await response.json()
        setReasons(data)
      }
    } catch (error) {
      console.error('Failed to fetch reasons:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReasons()
  }, [])

  // Form handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validate form
    if (!formData.name.trim()) {
      setErrors({ name: 'Reason name is required' })
      return
    }

    try {
      const url = editingReason ? `/api/reasons/${editingReason.id}` : '/api/reasons'
      const method = editingReason ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchReasons()
        resetForm()
      } else {
        const error = await response.json()
        setErrors({ general: error.error || 'Failed to save reason' })
      }
    } catch (error) {
      setErrors({ general: 'Failed to save reason' })
    }
  }

  const handleEdit = (reason: Reason) => {
    setEditingReason(reason)
    setFormData({
      name: reason.name,
      isActive: reason.isActive
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string, reasonName: string) => {
    if (!confirm(`Are you sure you want to delete the reason "${reasonName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/reasons/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchReasons()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete reason')
      }
    } catch (error) {
      alert('Failed to delete reason')
    }
  }

  const toggleStatus = async (reason: Reason) => {
    try {
      const response = await fetch(`/api/reasons/${reason.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: reason.name,
          isActive: !reason.isActive
        }),
      })

      if (response.ok) {
        await fetchReasons()
      } else {
        alert('Failed to update reason status')
      }
    } catch (error) {
      alert('Failed to update reason status')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      isActive: true
    })
    setEditingReason(null)
    setShowForm(false)
    setErrors({})
  }

  if (loading) {
    return <div className="p-6">Loading reasons data...</div>
  }

  const activeReasons = reasons.filter(r => r.isActive)
  const inactiveReasons = reasons.filter(r => !r.isActive)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reasons Management</h1>
          <p className="text-muted-foreground">
            Manage work from home reasons and categories
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Reason'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingReason ? 'Edit Reason' : 'Add New Reason'}
          </h2>
          
          {errors.general && (
            <div className="text-red-600 mb-4">{errors.general}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Reason Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter reason name"
                />
                {errors.name && (
                  <div className="text-red-600 text-sm mt-1">{errors.name}</div>
                )}
              </div>

              <div>
                <Label htmlFor="isActive">Status</Label>
                <Select
                  id="isActive"
                  value={formData.isActive ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                >
                  <Option value="true">Active</Option>
                  <Option value="false">Inactive</Option>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {editingReason ? 'Update' : 'Create'} Reason
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-6">
        {/* Active Reasons */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-green-700">
              Active Reasons ({activeReasons.length})
            </h2>
            
            {activeReasons.length === 0 ? (
              <p className="text-muted-foreground">No active reasons found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reason Name</TableHead>
                    <TableHead>Usage Count</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeReasons.map((reason) => (
                    <TableRow key={reason.id}>
                      <TableCell className="font-medium">{reason.name}</TableCell>
                      <TableCell>
                        {reason._count?.entries ?? 0} entries
                      </TableCell>
                      <TableCell>
                        {new Date(reason.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(reason)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleStatus(reason)}
                            className="text-orange-600 hover:text-orange-800"
                          >
                            Deactivate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(reason.id, reason.name)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>

        {/* Inactive Reasons */}
        {inactiveReasons.length > 0 && (
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-red-700">
                Inactive Reasons ({inactiveReasons.length})
              </h2>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reason Name</TableHead>
                    <TableHead>Usage Count</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inactiveReasons.map((reason) => (
                    <TableRow key={reason.id} className="opacity-60">
                      <TableCell className="font-medium">{reason.name}</TableCell>
                      <TableCell>
                        {reason._count?.entries ?? 0} entries
                      </TableCell>
                      <TableCell>
                        {new Date(reason.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(reason)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleStatus(reason)}
                            className="text-green-600 hover:text-green-800"
                          >
                            Activate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(reason.id, reason.name)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            💡 Tips for Managing Reasons
          </h3>
          <ul className="text-blue-700 space-y-1 text-sm">
            <li>• Use descriptive names that staff can easily understand</li>
            <li>• Deactivate reasons instead of deleting them to preserve historical data</li>
            <li>• Common reasons include: Medical, Family, Contractors, Deliveries, Load shedding, etc.</li>
            <li>• Monitor usage counts to identify the most common WFH reasons</li>
          </ul>
        </div>
      </Card>
    </div>
  )
}