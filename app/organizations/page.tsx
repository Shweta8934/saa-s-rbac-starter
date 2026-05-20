'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PageHeader, EmptyState } from '@/components/common'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { StatusBadge, PlanBadge, PermissionGate } from '@/components/rbac'
import { organizations } from '@/data/organizations'
import { getUsersByOrganization } from '@/data/users'
import { subscriptionPlans } from '@/data/subscriptions'
import { 
  Plus, 
  Search, 
  Building2,
  ArrowRight,
  Users,
} from 'lucide-react'
import { format } from 'date-fns'

export default function OrganizationsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredOrganizations = organizations.filter((org) => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         org.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || org.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Organizations"
        description="Manage all organizations in the system"
      >
        <PermissionGate module="organizations" action="create">
          <Link href="/organizations/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Organization
            </Button>
          </Link>
        </PermissionGate>
      </PageHeader>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4 p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search organizations..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Organizations Table */}
      {filteredOrganizations.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrganizations.map((org) => {
                  const plan = subscriptionPlans.find(p => p.id === org.subscriptionPlanId)
                  const members = getUsersByOrganization(org.id)
                  return (
                    <TableRow key={org.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted font-semibold">
                            {org.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium">{org.name}</p>
                            <p className="text-sm text-muted-foreground">{org.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{org.industry}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {members.length}
                        </div>
                      </TableCell>
                      <TableCell>
                        <PlanBadge plan={plan?.name || 'Free'} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={org.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(org.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Link href={`/organizations/${org.id}`}>
                          <Button variant="ghost" size="sm">
                            View <ArrowRight className="ml-1 h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          icon={Building2}
          title="No organizations found"
          description={searchQuery || statusFilter !== 'all' 
            ? "Try adjusting your search or filter criteria" 
            : "Get started by creating your first organization"
          }
          action={{
            label: 'Create Organization',
            onClick: () => window.location.href = '/organizations/create'
          }}
        />
      )}
    </div>
  )
}
