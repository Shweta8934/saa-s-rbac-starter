'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageHeader } from '@/components/common'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { organizations } from '@/data/organizations'
import { subscriptionPlans } from '@/data/subscriptions'
import { INDUSTRIES } from '@/lib/constants'
import { ArrowLeft, Building2 } from 'lucide-react'
import Link from 'next/link'

const createOrgSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  industry: z.string().min(1, 'Please select an industry'),
  description: z.string().optional(),
  subscriptionPlanId: z.string().min(1, 'Please select a plan'),
})

type CreateOrgFormData = z.infer<typeof createOrgSchema>

export default function CreateOrganizationPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateOrgFormData>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: {
      subscriptionPlanId: 'plan-free',
    },
  })

  const onSubmit = async (data: CreateOrgFormData) => {
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Create new organization (in real app, this would go to backend)
    const newOrg = {
      id: `org-${Date.now()}`,
      name: data.name,
      slug: data.name.toLowerCase().replace(/\s+/g, '-'),
      email: data.email,
      industry: data.industry as 'technology' | 'healthcare' | 'finance' | 'education' | 'retail' | 'manufacturing' | 'consulting' | 'other',
      status: 'active' as const,
      createdAt: new Date().toISOString(),
      subscriptionPlanId: data.subscriptionPlanId,
      ownerId: 'user-1', // Would be current user in real app
      description: data.description,
    }

    organizations.push(newOrg)
    
    toast.success('Organization created successfully!')
    setIsSubmitting(false)
    router.push('/organizations')
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Create Organization"
        description="Add a new organization to the system"
      >
        <Link href="/organizations">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
      </PageHeader>

      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>Enter the details for the new organization</CardDescription>
            </div>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name *</Label>
                <Input
                  id="name"
                  placeholder="Acme Inc."
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@acme.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Industry *</Label>
                <Select onValueChange={(value) => setValue('industry', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry.value} value={industry.value}>
                        {industry.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.industry && (
                  <p className="text-sm text-destructive">{errors.industry.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Subscription Plan *</Label>
                <Select 
                  defaultValue="plan-free"
                  onValueChange={(value) => setValue('subscriptionPlanId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {subscriptionPlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - ${plan.price}/mo
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.subscriptionPlanId && (
                  <p className="text-sm text-destructive">{errors.subscriptionPlanId.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the organization..."
                rows={3}
                {...register('description')}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href="/organizations">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Spinner className="mr-2 h-4 w-4" />}
                Create Organization
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}
