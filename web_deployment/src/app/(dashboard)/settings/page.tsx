'use client'

import { useState, useEffect } from 'react'
import { CustomFieldsManager } from '@/components/settings/CustomFieldsManager'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/client'
import { Label } from '@/components/ui/label'

export default function SettingsPage() {
  const [account, setAccount] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase
            .from('accounts')
            .select('*')
            .eq('user_id', user.id)
            .single()
          setAccount(data)
        }
      } catch (error) {
        console.error('Error fetching account:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAccount()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600 mx-auto"></div>
          <p className="text-slate-500 text-sm">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and custom trade plan.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>View your current account settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-500">Account Size</Label>
              <div className="text-lg font-semibold">{account?.size} {account?.currency}</div>
            </div>
            <div>
              <Label className="text-slate-500">Default Risk %</Label>
              <div className="text-lg font-semibold">{account?.default_risk_percent}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <CustomFieldsManager />
    </div>
  )
}
