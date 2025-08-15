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

interface Staff {
  id: string
  fullName: string
  email: string | null
  active: boolean
  role: string
  createdAt: string
  _count?: {
    entries: number
  }
}

interface StaffFormData {
  fullName: string
  email: string
  active: boolean
  role: 'USER' | 'ADMIN'
}

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<Staff[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [formData, setFormData] = useState<StaffFormData>({
    fullName: '',
    email: '',
    active: true,
    role: 'USER'
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch staff data
  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/staff')
      if (response.ok) {
        const data = await response.json()
        setStaff(data)
      }
    } catch (error) {
      console.error('Failed to fetch staff:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaff()
  }, [])

  // Form handlers
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    try {
      const url = editingStaff ? `/api/staff/${editingStaff.id}` : '/api/staff'
      const method = editingStaff ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          email: formData.email || undefined
        }),
      })

      if (response.ok) {
        await fetchStaff()
        resetForm()
      } else {
        const error = await response.json()
        setErrors({ general: error.error || 'Failed to save staff member' })
      }
    } catch (error) {
      setErrors({ general: 'Failed to save staff member' })
    }
  }

  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember)
    setFormData({
      fullName: staffMember.fullName,
      email: staffMember.email || '',
      active: staffMember.active,
      role: staffMember.role as 'USER' | 'ADMIN'
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) {
      return
    }

    try {
      const response = await fetch(`/api/staff/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchStaff()
      } else {
        alert('Failed to delete staff member')
      }
    } catch (error) {
      alert('Failed to delete staff member')
    }
  }

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      active: true,
      role: 'USER'
    })
    setEditingStaff(null)
    setShowForm(false)
    setErrors({})
  }

  if (loading) {
    return <div className="p-6">Loading staff data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage staff members and their access
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Add Staff Member'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
          </h2>
          
          {errors.general && (
            <div className="text-red-600 mb-4">{errors.general}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter full name"
                />
                {errors.fullName && (
                  <div className="text-red-600 text-sm mt-1">{errors.fullName}</div>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <div className="text-red-600 text-sm mt-1">{errors.email}</div>
                )}
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'USER' | 'ADMIN' })}
                >
                  <Option value="USER">User</Option>
                  <Option value="ADMIN">Admin</Option>
                </Select>
              </div>

              <div>
                <Label htmlFor="active">Status</Label>
                <Select
                  id="active"
                  value={formData.active ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
                >
                  <Option value="true">Active</Option>
                  <Option value="false">Inactive</Option>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit">
                {editingStaff ? 'Update' : 'Create'} Staff Member
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Staff Members ({staff.length})</h2>
          
          {staff.length === 0 ? (
            <p className="text-muted-foreground">No staff members found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>WFH Entries</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.fullName}</TableCell>
                    <TableCell>{member.email || 'N/A'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        member.role === 'ADMIN' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {member.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        member.active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {member.active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {member._count?.entries ?? 0} entries
                    </TableCell>
                    <TableCell>
                      {new Date(member.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(member)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(member.id)}
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
    </div>
  )
}