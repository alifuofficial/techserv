'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  Globe,
  ShoppingCart,
  ShieldCheck,
  Loader2,
  RotateCcw,
  Save,
  AlertTriangle,
  Send,
  Zap,
  Mail,
  Upload,
  Image as ImageIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

interface SettingItem {
  id: string
  key: string
  value: string
  label: string
  type: string
  group: string
  createdAt: string
  updatedAt: string
}

interface SettingsResponse {
  settings: SettingItem[]
  groups: Record<string, SettingItem[]>
}

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

const groupMeta: Record<string, { label: string; description: string; icon: React.ElementType; accent: string; color: string }> = {
  general: { label: 'General', description: 'Site configuration and branding', icon: Globe, accent: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', color: 'bg-blue-500' },
  telegram: { label: 'Telegram', description: 'Bot config and login settings', icon: Send, accent: 'bg-sky-500/10 text-sky-600 dark:text-sky-400', color: 'bg-sky-500' },
  orders: { label: 'Orders', description: 'Order processing settings', icon: ShoppingCart, accent: 'bg-primary/10 text-primary', color: 'bg-primary' },
  system: { label: 'System', description: 'System and maintenance', icon: ShieldCheck, accent: 'bg-green-500/10 text-green-600 dark:text-green-400', color: 'bg-green-500' },
  features: { label: 'Features', description: 'Toggle platform features', icon: Zap, accent: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', color: 'bg-amber-500' },
  email: { label: 'Email', description: 'SMTP and notification settings', icon: Mail, accent: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', color: 'bg-purple-500' },
}

const settingDescriptions: Record<string, string> = {
  site_name: 'The name displayed across the platform and in browser tabs',
  site_email: 'Primary contact email shown to customers for support',
  site_description: 'A brief description used in SEO and meta tags',
  site_url: 'The canonical URL of your platform',
  maintenance_mode: 'When enabled, visitors will see a maintenance page',
  auto_approve: 'Automatically approve orders when payment proof is verified',
  max_orders_per_day: 'Maximum new orders per day (0 = unlimited)',
  order_confirmation_email: 'Enable automatic order confirmation emails',
  telegram_channel: 'Default Telegram channel for order notifications',
  webhook_url: 'Endpoint URL for order status webhook callbacks',
  api_rate_limit: 'Maximum API requests per minute per user',
  session_timeout: 'User session duration in minutes before auto-logout',
  registration_enabled: 'Allow new users to create accounts',
  currency: 'Default currency for prices and payments',
  timezone: 'Platform timezone for scheduling and display',
  email_notifications: 'Enable email notifications for system events',
  sms_notifications: 'Enable SMS notifications for order updates',
  logo_url: 'URL or path to your company logo',
  seo_title: 'Title tag optimized for search engines',
  seo_description: 'Meta description shown in search results',
  seo_keywords: 'Comma-separated keywords for search engines',
  seo_author: 'The author meta tag of the application',
  telegram_bot_token: 'The unique HTTP API token from @BotFather',
  telegram_bot_username: 'Your bot handle (e.g. @MilkyTech.OnlineBot)',
  telegram_enabled: 'Allow users to register and sign in using Telegram',
  telegram_notifications: 'Send automated order status updates via the bot',
  account_tier_enabled: 'Display account tiers (Standard, Gold, etc.) and benefits',
  referral_system_enabled: 'Activate the referral program with unique links',
  tier_benefits_standard: 'Features and perks for Standard accounts',
  tier_benefits_gold: 'Features and perks for Gold accounts',
  referral_benefits: 'Rewards for successful user referrals',
  welcome_message: 'Welcome message shown to new users',
  order_confirmation_message: 'Message sent when an order is placed',
  currency_symbol: 'Symbol used for currency display',
  site_phone: 'Phone number shown for customer support',
  smtp_host: 'The hostname of your SMTP server (e.g., smtp.gmail.com)',
  smtp_port: 'The port number for your SMTP server (usually 587 or 465)',
  smtp_user: 'The username (often email) used to authenticate with the SMTP server',
  smtp_pass: 'The password used to authenticate with the SMTP server',
  smtp_secure: 'Use SSL/TLS for a secure connection to the SMTP server',
  smtp_from_email: 'The email address used as the "From" address for sent emails',
  smtp_from_name: 'The display name used as the "From" name for sent emails',
}

function getDescription(key: string, label: string): string {
  return settingDescriptions[key] || `Configure the ${label.toLowerCase()} for your platform`
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-56" />
      </div>
      <Skeleton className="h-9 w-80" />
      <Card className="border-border/40">
        <CardHeader><div className="space-y-2"><Skeleton className="h-5 w-32" /><Skeleton className="h-4 w-64" /></div></CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              {i > 0 && <Separator className="mb-6" />}
              <div className="space-y-3">
                <div className="space-y-1.5"><Skeleton className="h-4 w-36" /><Skeleton className="h-3 w-64" /></div>
                <Skeleton className="h-9 w-full max-w-md" />
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter className="border-t pt-4"><div className="flex items-center gap-2 ml-auto"><Skeleton className="h-9 w-24" /><Skeleton className="h-9 w-32" /></div></CardFooter>
      </Card>
    </div>
  )
}

function ToggleSetting({ setting, value, onChange, disabled }: {
  setting: SettingItem, value: boolean, onChange: (val: boolean) => void, disabled: boolean
}) {
  const isDangerous = setting.key === 'maintenance_mode' && value
  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
      isDangerous
        ? 'border-amber-300/60 bg-amber-50/50 dark:border-amber-700/40 dark:bg-amber-950/20'
        : 'border-border/40 bg-muted/20 hover:bg-muted/40'
    }`}>
      <div className="min-w-0 flex-1 mr-4">
        <div className="flex items-center gap-2">
          <Label htmlFor={setting.key} className="font-medium text-sm cursor-pointer">{setting.label}</Label>
          {isDangerous && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-400">
              Active
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{getDescription(setting.key, setting.label)}</p>
      </div>
      <Switch id={setting.key} checked={value} onCheckedChange={onChange} disabled={disabled} className="shrink-0" />
    </div>
  )
}

    </div>
  )
}

function TextSetting({ setting, value, onChange, disabled }: {
  setting: SettingItem, value: string, onChange: (val: string) => void, disabled: boolean
}) {
  const isSecret = setting.key.includes('token') || setting.key.includes('secret') || setting.key.includes('pass')
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={setting.key} className="font-medium text-sm">{setting.label}</Label>
        {isSecret && (
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-red-300 text-red-600 dark:border-red-700 dark:text-red-400">
            Secret
          </Badge>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{getDescription(setting.key, setting.label)}</p>
      {setting.type === 'textarea' ? (
        <Textarea id={setting.key} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} rows={3} className="max-w-lg resize-none" />
      ) : (
        <Input id={setting.key} type={isSecret ? 'password' : 'text'} value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className="max-w-lg" />
      )}
    </div>
  )
}

function LogoUpload({ value, onUpdate, disabled }: { value: string, onUpdate: (url: string) => void, disabled: boolean }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await fetch('/api/admin/settings/logo', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to upload logo');
      
      const data = await res.json();
      onUpdate(data.url);
      toast.success('Logo uploaded successfully');
    } catch (err) {
      toast.error('Upload failed', { description: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Site Logo</Label>
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl border-2 border-dashed border-border/60 bg-muted/20 hover:bg-muted/30 transition-all">
        <div className="h-20 w-20 rounded-xl bg-background border flex items-center justify-center overflow-hidden shadow-sm">
          {value ? (
            <img src={value} alt="Current Logo" className="h-full w-full object-contain p-2" />
          ) : (
            <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
          )}
        </div>
        <div className="flex-1 space-y-3 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Update Company Logo</h4>
            <p className="text-xs text-muted-foreground">Upload your brand logo (PNG, JPG, or SVG recommended)</p>
          </div>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={disabled || uploading}
              className="relative overflow-hidden group h-9"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5 mr-2 transition-transform group-hover:-translate-y-0.5" />
              )}
              {uploading ? 'Uploading...' : 'Choose File'}
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                accept="image/*"
                onChange={handleUpload}
                disabled={disabled || uploading}
              />
            </Button>
            {value && (
              <p className="text-[10px] font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                {value.split('/').pop()}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GroupSettingsCard({ groupKey, settings, formValues, onValueChange, onReset, onSave, saving, isDirty }: {
  groupKey: string, settings: SettingItem[], formValues: Record<string, string>,
  onValueChange: (key: string, value: string) => void, onReset: () => void, onSave: () => void, saving: boolean, isDirty: boolean
}) {
  const meta = groupMeta[groupKey] || { label: groupKey.charAt(0).toUpperCase() + groupKey.slice(1), description: 'Platform settings', icon: Settings, accent: 'bg-muted text-muted-foreground', color: 'bg-muted' }
  const Icon = meta.icon

  const toggleSettings = useMemo(() => settings.filter((s) => s.type === 'toggle'), [settings])
  const fieldSettings = useMemo(() => settings.filter((s) => s.type !== 'toggle'), [settings])
  const modifiedCount = useMemo(() => settings.filter((s) => {
    if (s.type === 'toggle') return (s.value === 'true') !== (formValues[s.key] === 'true')
    return formValues[s.key] !== s.value
  }).length, [settings, formValues])

  return (
    <Card className="border-border/40">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${meta.accent}`}>
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div>
            <CardTitle className="text-base">{meta.label}</CardTitle>
            <CardDescription className="text-xs mt-0.5">{meta.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {groupKey === 'general' && (
          <>
            <LogoUpload 
              value={formValues['logo_url']} 
              onUpdate={(url) => onValueChange('logo_url', url)} 
              disabled={saving} 
            />
            <Separator />
          </>
        )}
        {fieldSettings.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {fieldSettings.filter(s => s.key !== 'logo_url').map((setting) => (
              <TextSetting key={setting.key} setting={setting} value={formValues[setting.key] ?? setting.value} onChange={(val) => onValueChange(setting.key, val)} disabled={saving} />
            ))}
          </div>
        )}
        {fieldSettings.length > 0 && toggleSettings.length > 0 && <Separator />}
        {toggleSettings.length > 0 && (
          <div className="space-y-3">
            {toggleSettings.map((setting) => (
              <ToggleSetting key={setting.key} setting={setting} value={formValues[setting.key] === 'true'} onChange={(val) => onValueChange(setting.key, String(val))} disabled={saving} />
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t border-border/40 bg-muted/20 px-6 py-3">
        <div className="flex items-center justify-between w-full">
          <div>
            {isDirty && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-amber-600 dark:text-amber-400">{modifiedCount} {modifiedCount === 1 ? 'change' : 'changes'}</span> unsaved
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {groupKey === 'email' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={async () => {
                  const email = prompt('Enter email address to send test message to:');
                  if (!email) return;
                  toast.promise(
                    fetch('/api/admin/settings/test-email', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email }),
                    }).then(async (res) => {
                      if (!res.ok) {
                        const data = await res.json();
                        throw new Error(data.error || 'Failed to send test email');
                      }
                      return res.json();
                    }),
                    {
                      loading: 'Sending test email...',
                      success: 'Test email sent successfully!',
                      error: (err) => err.message,
                    }
                  );
                }}
                disabled={saving}
                className="mr-2"
              >
                <Send className="h-3.5 w-3.5 mr-1.5" /> Test Connection
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onReset} disabled={saving || !isDirty} className="text-muted-foreground">
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Discard
            </Button>
            <Button size="sm" onClick={onSave} disabled={saving || !isDirty} className="min-w-[120px]">
              {saving ? (<><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> Saving...</>) : (<><Save className="h-3.5 w-3.5 mr-1.5" /> Save Changes</>)}
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

export default function AdminSettingsPage() {
  const [originalData, setOriginalData] = useState<SettingsResponse | null>(null)
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState<string>('general')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function fetchSettings() {
      try {
        const res = await fetch('/api/admin/settings')
        if (!res.ok) return
        const data: SettingsResponse = await res.json()
        if (cancelled) return
        setOriginalData(data)
        const initial: Record<string, string> = {}
        for (const s of data.settings) initial[s.key] = s.value
        setFormValues(initial)
        const groupKeys = Object.keys(data.groups)
        if (groupKeys.length > 0) setActiveTab(groupKeys[0])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchSettings()
    return () => { cancelled = true }
  }, [])

  const handleValueChange = useCallback((key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }))
  }, [])

  const isGroupDirty = useCallback((groupKey: string): boolean => {
    if (!originalData) return false
    const groupSettings = originalData.groups[groupKey] || []
    return groupSettings.some((s) => {
      if (s.type === 'toggle') return (s.value === 'true') !== (formValues[s.key] === 'true')
      return formValues[s.key] !== s.value
    })
  }, [originalData, formValues])

  const handleResetGroup = useCallback((groupKey: string) => {
    if (!originalData) return
    const groupSettings = originalData.groups[groupKey] || []
    const resetValues: Record<string, string> = {}
    for (const s of groupSettings) resetValues[s.key] = s.value
    setFormValues((prev) => ({ ...prev, ...resetValues }))
    toast.info('Changes discarded', { description: `${groupMeta[groupKey]?.label || groupKey} settings reset` })
  }, [originalData])

  const handleSaveGroup = useCallback(async (groupKey: string) => {
    if (!originalData) return
    const groupSettings = originalData.groups[groupKey] || []
    const modified = groupSettings.filter((s) => {
      if (s.type === 'toggle') return (s.value === 'true') !== (formValues[s.key] === 'true')
      return formValues[s.key] !== s.value
    })
    if (modified.length === 0) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: modified.map((s) => ({ key: s.key, value: formValues[s.key] })) }),
      })
      if (!res.ok) { const errData = await res.json().catch(() => ({})); throw new Error(errData.error || 'Failed to save') }
      const updatedSettings = await res.json()
      const updatedMap: Record<string, string> = {}
      for (const us of updatedSettings) updatedMap[us.key] = us.value
      setOriginalData((prev) => {
        if (!prev) return prev
        const newSettings = prev.settings.map((s) => updatedMap[s.key] !== undefined ? { ...s, value: updatedMap[s.key] } : s)
        const newGroups: Record<string, SettingItem[]> = {}
        for (const [gk, gSettings] of Object.entries(prev.groups)) newGroups[gk] = gSettings.map((s) => updatedMap[s.key] !== undefined ? { ...s, value: updatedMap[s.key] } : s)
        return { settings: newSettings, groups: newGroups }
      })
      toast.success('Settings saved', { description: `${modified.length} ${modified.length === 1 ? 'setting' : 'settings'} updated in ${groupMeta[groupKey]?.label || groupKey}` })
    } catch (error) {
      toast.error('Failed to save', { description: error instanceof Error ? error.message : 'An unexpected error occurred' })
    } finally { setSaving(false) }
  }, [originalData, formValues])

  const groupKeys = useMemo(() => {
    if (!originalData) return []
    const keys = Object.keys(originalData.groups)
    const preferredOrder = ['general', 'telegram', 'email', 'orders', 'system', 'features']
    const ordered: string[] = []
    for (const pk of preferredOrder) if (keys.includes(pk)) ordered.push(pk)
    for (const k of keys) if (!ordered.includes(k)) ordered.push(k)
    return ordered
  }, [originalData])

  return (
    <motion.div className="p-4 md:p-6 space-y-6" variants={container} initial="hidden" animate="visible">
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Settings className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage platform configuration</p>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <motion.div variants={fadeUp}><PageSkeleton /></motion.div>
      ) : originalData && groupKeys.length > 0 ? (
        <>
          <motion.div variants={fadeUp}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                {groupKeys.map((groupKey) => {
                  const meta = groupMeta[groupKey]
                  const Icon = meta?.icon || Settings
                  const dirty = isGroupDirty(groupKey)
                  return (
                    <TabsTrigger key={groupKey} value={groupKey} className="gap-1.5">
                      <Icon className="h-3.5 w-3.5" />
                      {meta?.label || groupKey}
                      {dirty && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
                    </TabsTrigger>
                  )
                })}
              </TabsList>
              {groupKeys.map((groupKey) => (
                <TabsContent key={groupKey} value={groupKey} className="mt-4">
                  <motion.div key={groupKey} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                    <GroupSettingsCard
                      groupKey={groupKey}
                      settings={originalData.groups[groupKey] || []}
                      formValues={formValues}
                      onValueChange={handleValueChange}
                      onReset={() => handleResetGroup(groupKey)}
                      onSave={() => handleSaveGroup(groupKey)}
                      saving={saving}
                      isDirty={isGroupDirty(groupKey)}
                    />
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>
          </motion.div>
        </>
      ) : (
        <motion.div variants={fadeUp}>
          <Card className="border-border/40">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                <Settings className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-1">No settings found</h3>
              <p className="text-sm text-muted-foreground max-w-xs">Settings will appear here once configured. Contact your administrator.</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}