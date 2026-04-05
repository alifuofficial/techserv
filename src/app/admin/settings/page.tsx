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
  Info,
  Send,
  Bot,
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

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */
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

/* ────────────────────────────────────────────
   Animation Variants
   ──────────────────────────────────────────── */
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
}

/* ────────────────────────────────────────────
   Group Metadata
   ──────────────────────────────────────────── */
const groupMeta: Record<
  string,
  { label: string; description: string; icon: React.ElementType; accent: string; accentBg: string }
> = {
  general: {
    label: 'General',
    description: 'Basic site configuration and branding',
    icon: Globe,
    accent: 'text-blue-600 dark:text-blue-400',
    accentBg: 'bg-blue-100 dark:bg-blue-900/30',
  },
  orders: {
    label: 'Orders',
    description: 'Order processing and customer communication',
    icon: ShoppingCart,
    accent: 'text-primary',
    accentBg: 'bg-primary/10',
  },
  system: {
    label: 'System',
    description: 'System-level settings and maintenance',
    icon: ShieldCheck,
    accent: 'text-green-600 dark:text-green-400',
    accentBg: 'bg-green-100 dark:bg-green-900/30',
  },
  telegram: {
    label: 'Telegram',
    description: 'Bot configuration and notification settings',
    icon: Send,
    accent: 'text-sky-500',
    accentBg: 'bg-sky-50 dark:bg-sky-900/20',
  },
}

/* ────────────────────────────────────────────
   Setting Descriptions (derived from key/label)
   ──────────────────────────────────────────── */
const settingDescriptions: Record<string, string> = {
  site_name: 'The name displayed across the platform and in browser tabs',
  site_email: 'Primary contact email shown to customers for support',
  site_description: 'A brief description of your platform used in SEO and meta tags',
  site_url: 'The canonical URL of your platform',
  maintenance_mode:
    'When enabled, visitors will see a maintenance page instead of the main site',
  auto_approve:
    'Automatically approve orders when payment proof is verified',
  max_orders_per_day:
    'Maximum number of new orders accepted per day (0 = unlimited)',
  order_confirmation_email: 'Enable automatic order confirmation emails to customers',
  telegram_channel: 'Default Telegram channel for order notifications',
  webhook_url: 'Endpoint URL for receiving order status webhook callbacks',
  api_rate_limit: 'Maximum API requests allowed per minute per user',
  session_timeout: 'User session duration in minutes before auto-logout',
  enable_registration: 'Allow new users to register on the platform',
  currency: 'Default currency used for displaying prices and payments',
  timezone: 'Platform timezone used for scheduling and display purposes',
  email_notifications: 'Enable email notifications for important system events',
  sms_notifications: 'Enable SMS notifications for order updates',
  logo_url: 'URL or path to your company logo (e.g., https://example.com/logo.png)',
  seo_title: 'Title tag optimized for Google Search Engines',
  seo_description: 'Meta description snippet shown in Google search results',
  seo_keywords: 'Comma separated keywords to help Google understand your specific niche',
  seo_author: 'The author meta tag of the application',
  telegram_bot_token: 'The unique HTTP API token from @BotFather',
  telegram_bot_username: 'Your bot handle (e.g. @TechServBot)',
  telegram_enabled: 'Allow users to register and sign in using their Telegram account',
  telegram_notifications: 'Send automated order status updates via the bot',
}

function getDescription(key: string, label: string): string {
  return settingDescriptions[key] || `Configure the ${label.toLowerCase()} for your platform`
}

/* ────────────────────────────────────────────
   Skeleton Loaders
   ──────────────────────────────────────────── */
function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-md" />
          <Skeleton className="h-7 w-28" />
        </div>
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Tabs skeleton */}
      <Skeleton className="h-9 w-72" />

      {/* Card skeleton */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              {i > 0 && <Separator className="mb-6" />}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-72" />
                </div>
                <Skeleton className="h-9 w-full max-w-md" />
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter className="border-t pt-4">
          <div className="flex items-center gap-2 ml-auto">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-32" />
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

/* ────────────────────────────────────────────
   Toggle Setting Component
   ──────────────────────────────────────────── */
function ToggleSetting({
  setting,
  value,
  onChange,
  disabled,
}: {
  setting: SettingItem
  value: boolean
  onChange: (val: boolean) => void
  disabled: boolean
}) {
  const isDangerous = setting.key === 'maintenance_mode' && value
  const isAutoApprove = setting.key === 'auto_approve'

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
        isDangerous
          ? 'border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30'
          : isAutoApprove && value
            ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30'
            : 'border-border/60 bg-muted/20 hover:bg-muted/40'
      }`}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5 ${
            isDangerous
              ? 'bg-yellow-100 dark:bg-yellow-900/40'
              : isAutoApprove
                ? 'bg-blue-100 dark:bg-blue-900/40'
                : 'bg-muted'
          }`}
        >
          {isDangerous ? (
            <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          ) : (
            <Info className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Label htmlFor={setting.key} className="font-medium text-sm cursor-pointer">
              {setting.label}
            </Label>
            {isDangerous && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 border-yellow-300 text-yellow-700 dark:border-yellow-700 dark:text-yellow-400"
              >
                Active
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            {getDescription(setting.key, setting.label)}
          </p>
        </div>
      </div>
      <Switch
        id={setting.key}
        checked={value}
        onCheckedChange={onChange}
        disabled={disabled}
        className="shrink-0 ml-4"
      />
    </div>
  )
}

/* ────────────────────────────────────────────
   Text/Textarea Setting Component
   ──────────────────────────────────────────── */
function TextSetting({
  setting,
  value,
  onChange,
  disabled,
}: {
  setting: SettingItem
  value: string
  onChange: (val: string) => void
  disabled: boolean
}) {
  const isTextarea = setting.type === 'textarea'

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={setting.key} className="font-medium text-sm">
          {setting.label}
        </Label>
        <span className="text-[10px] font-mono text-muted-foreground/60 bg-muted px-1.5 py-0.5 rounded">
          {setting.key}
        </span>
      </div>
      <p className="text-xs text-muted-foreground">
        {getDescription(setting.key, setting.label)}
      </p>
      {isTextarea ? (
        <Textarea
          id={setting.key}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          rows={3}
          className="max-w-lg resize-none"
        />
      ) : (
        <Input
          id={setting.key}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="max-w-lg"
        />
      )}
    </div>
  )
}

/* ────────────────────────────────────────────
   Group Settings Card Component
   ──────────────────────────────────────────── */
function GroupSettingsCard({
  groupKey,
  settings,
  formValues,
  onValueChange,
  onReset,
  onSave,
  saving,
  isDirty,
}: {
  groupKey: string
  settings: SettingItem[]
  formValues: Record<string, string>
  onValueChange: (key: string, value: string) => void
  onReset: () => void
  onSave: () => void
  saving: boolean
  isDirty: boolean
}) {
  const meta = groupMeta[groupKey] || {
    label: groupKey.charAt(0).toUpperCase() + groupKey.slice(1),
    description: 'Platform settings',
    icon: Settings,
    accent: 'text-muted-foreground',
    accentBg: 'bg-muted',
  }
  const Icon = meta.icon

  const toggleSettings = useMemo(
    () => settings.filter((s) => s.type === 'toggle'),
    [settings]
  )
  const fieldSettings = useMemo(
    () => settings.filter((s) => s.type !== 'toggle'),
    [settings]
  )

  const modifiedCount = useMemo(
    () =>
      settings.filter((s) => {
        if (s.type === 'toggle') {
          const original = s.value === 'true'
          const current = formValues[s.key] === 'true'
          return original !== current
        }
        return formValues[s.key] !== s.value
      }).length,
    [settings, formValues]
  )

  return (
    <Card className="border-border/60">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.accentBg}`}
          >
            <Icon className={`h-4.5 w-4.5 ${meta.accent}`} />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-base">{meta.label}</CardTitle>
            <CardDescription className="mt-0.5">{meta.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Field settings (text, textarea, select) */}
        {fieldSettings.length > 0 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {fieldSettings.map((setting) => (
                <TextSetting
                  key={setting.key}
                  setting={setting}
                  value={formValues[setting.key] ?? setting.value}
                  onChange={(val) => onValueChange(setting.key, val)}
                  disabled={saving}
                />
              ))}
            </div>
          </div>
        )}

        {/* Separator between field and toggle sections */}
        {fieldSettings.length > 0 && toggleSettings.length > 0 && (
          <Separator />
        )}

        {/* Toggle settings */}
        {toggleSettings.length > 0 && (
          <div className="space-y-3">
            {toggleSettings.map((setting) => (
              <ToggleSetting
                key={setting.key}
                setting={setting}
                value={formValues[setting.key] === 'true'}
                onChange={(val) => onValueChange(setting.key, String(val))}
                disabled={saving}
              />
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t bg-muted/20 px-6 py-3">
        <div className="flex items-center justify-between w-full">
          <div>
            {isDirty && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  {modifiedCount} {modifiedCount === 1 ? 'change' : 'changes'}
                </span>{' '}
                unsaved
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              disabled={saving || !isDirty}
              className="text-muted-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Discard
            </Button>
            <Button
              size="sm"
              onClick={onSave}
              disabled={saving || !isDirty}
              className="min-w-[120px]"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

/* ────────────────────────────────────────────
   Main Page Component
   ──────────────────────────────────────────── */
export default function AdminSettingsPage() {
  const [originalData, setOriginalData] = useState<SettingsResponse | null>(null)
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState<string>('general')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Fetch settings
  useEffect(() => {
    let cancelled = false
    async function fetchSettings() {
      try {
        const res = await fetch('/api/admin/settings')
        if (!res.ok) return
        const data: SettingsResponse = await res.json()
        if (cancelled) return

        setOriginalData(data)

        // Build initial form values map
        const initial: Record<string, string> = {}
        for (const s of data.settings) {
          initial[s.key] = s.value
        }
        setFormValues(initial)

        // Set active tab to first group key
        const groupKeys = Object.keys(data.groups)
        if (groupKeys.length > 0) {
          setActiveTab(groupKeys[0])
        }
      } catch {
        // silently handle
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchSettings()
    return () => {
      cancelled = true
    }
  }, [])

  // Handle value change
  const handleValueChange = useCallback((key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }))
  }, [])

  // Check if a specific group is dirty
  const isGroupDirty = useCallback(
    (groupKey: string): boolean => {
      if (!originalData) return false
      const groupSettings = originalData.groups[groupKey] || []
      return groupSettings.some((s) => {
        if (s.type === 'toggle') {
          return (s.value === 'true') !== (formValues[s.key] === 'true')
        }
        return formValues[s.key] !== s.value
      })
    },
    [originalData, formValues]
  )

  // Reset a specific group to original values
  const handleResetGroup = useCallback(
    (groupKey: string) => {
      if (!originalData) return
      const groupSettings = originalData.groups[groupKey] || []
      const resetValues: Record<string, string> = {}
      for (const s of groupSettings) {
        resetValues[s.key] = s.value
      }
      setFormValues((prev) => ({ ...prev, ...resetValues }))
      toast.info('Changes discarded', {
        description: `${groupMeta[groupKey]?.label || groupKey} settings reset to saved values`,
      })
    },
    [originalData]
  )

  // Save a specific group
  const handleSaveGroup = useCallback(
    async (groupKey: string) => {
      if (!originalData) return
      const groupSettings = originalData.groups[groupKey] || []

      // Collect only the modified settings for this group
      const modified = groupSettings.filter((s) => {
        if (s.type === 'toggle') {
          return (s.value === 'true') !== (formValues[s.key] === 'true')
        }
        return formValues[s.key] !== s.value
      })

      if (modified.length === 0) return

      setSaving(true)
      try {
        const res = await fetch('/api/admin/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            settings: modified.map((s) => ({
              key: s.key,
              value: formValues[s.key],
            })),
          }),
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}))
          throw new Error(errData.error || 'Failed to save settings')
        }

        const updatedSettings = await res.json()

        // Update original data with the new values
        const updatedMap: Record<string, string> = {}
        for (const us of updatedSettings) {
          updatedMap[us.key] = us.value
        }

        setOriginalData((prev) => {
          if (!prev) return prev
          const newSettings = prev.settings.map((s) => {
            if (updatedMap[s.key] !== undefined) {
              return { ...s, value: updatedMap[s.key] }
            }
            return s
          })
          const newGroups: Record<string, SettingItem[]> = {}
          for (const [gk, gSettings] of Object.entries(prev.groups)) {
            newGroups[gk] = gSettings.map((s) => {
              if (updatedMap[s.key] !== undefined) {
                return { ...s, value: updatedMap[s.key] }
              }
              return s
            })
          }
          return { settings: newSettings, groups: newGroups }
        })

        toast.success('Settings saved successfully', {
          description: `${modified.length} ${modified.length === 1 ? 'setting' : 'settings'} updated in ${groupMeta[groupKey]?.label || groupKey}`,
        })
      } catch (error) {
        toast.error('Failed to save settings', {
          description: error instanceof Error ? error.message : 'An unexpected error occurred',
        })
      } finally {
        setSaving(false)
      }
    },
    [originalData, formValues]
  )

  // Get ordered group keys
  const groupKeys = useMemo(() => {
    if (!originalData) return []
    const keys = Object.keys(originalData.groups)
    // Maintain a consistent order: general, orders, system, then any others
    const preferredOrder = ['general', 'telegram', 'orders', 'system']
    const ordered: string[] = []
    for (const pk of preferredOrder) {
      if (keys.includes(pk)) ordered.push(pk)
    }
    for (const k of keys) {
      if (!ordered.includes(k)) ordered.push(k)
    }
    return ordered
  }, [originalData])

  return (
    <motion.div
      className="p-4 md:p-6 space-y-6"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {/* ── Page Header ── */}
      <motion.div variants={fadeUp} transition={{ delay: 0 }}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Settings className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage your platform configuration
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── Loading State ── */}
      {loading ? (
        <motion.div variants={fadeUp} transition={{ delay: 0.05 }}>
          <PageSkeleton />
        </motion.div>
      ) : originalData && groupKeys.length > 0 ? (
        <>
          {/* ── Tabs ── */}
          <motion.div variants={fadeUp} transition={{ delay: 0.05 }}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                {groupKeys.map((groupKey) => {
                  const meta = groupMeta[groupKey]
                  const Icon = meta?.icon || Settings
                  const dirty = isGroupDirty(groupKey)
                  return (
                    <TabsTrigger
                      key={groupKey}
                      value={groupKey}
                      className="gap-1.5"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {meta?.label || groupKey}
                      {dirty && (
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      )}
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              {/* ── Tab Contents ── */}
              {groupKeys.map((groupKey) => (
                <TabsContent key={groupKey} value={groupKey} className="mt-4">
                  <motion.div
                    key={groupKey}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
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
        /* ── Empty State ── */
        <motion.div variants={fadeUp} transition={{ delay: 0.05 }}>
          <Card className="border-border/60">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                <Settings className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-sm mb-1">No settings found</h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                Settings will appear here once they are configured. Contact your system administrator to add settings.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
