'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { 
  Megaphone, 
  Send, 
  MessageCircle, 
  Mail, 
  Users, 
  Sparkles, 
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

export default function AdminBroadcastsPage() {
  const [channel, setChannel] = useState('both')
  const [target, setTarget] = useState('all')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [successStats, setSuccessStats] = useState<null | {
    totalTargeted: number;
    queuedForTelegram: number;
    queuedForEmail: number;
  }>(null)

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error('Message empty', { description: 'Please enter a message to broadcast.' })
      return
    }

    setSending(true)
    setSuccessStats(null)
    
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, target, message }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success('Broadcast Dispatched!', { 
          description: \`Message queued to \${data.stats.totalTargeted} users.\`
        })
        setSuccessStats(data.stats)
        setMessage('')
      } else {
        toast.error('Failed to send broadcast', { description: data.error })
      }
    } catch {
      toast.error('Network error', { description: 'Could not connect to the broadcast service.' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl space-y-6">
      <motion.div variants={container} initial="hidden" animate="visible" className="space-y-6">
        
        {/* Header */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Megaphone className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Marketing Broadcasts</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Announce updates, promotions, and news to your customer base.
              </p>
            </div>
          </div>
        </motion.div>

        {successStats && (
          <motion.div variants={fadeUp} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Alert className="border-emerald-500/20 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <AlertTitle className="text-emerald-700 dark:text-emerald-400 font-bold">Successfully Dispatched!</AlertTitle>
              <AlertDescription className="mt-2 text-xs flex gap-4 font-medium">
                <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Checked: {successStats.totalTargeted}</span>
                <span className="flex items-center gap-1.5"><MessageCircle className="h-3.5 w-3.5" /> Telegram: {successStats.queuedForTelegram}</span>
                <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email: {successStats.queuedForEmail}</span>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Composer Card */}
        <motion.div variants={fadeUp}>
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-primary to-blue-500" />
            <CardHeader className="bg-muted/10 pb-4 border-b border-border/50">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Message Composer
              </CardTitle>
              <CardDescription>
                Configure who will receive this message and via which platform.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x border-b border-border/50">
                {/* Channel Select */}
                <div className="p-5 space-y-3 bg-card">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Megaphone className="h-3 w-3" /> Channel
                  </Label>
                  <Select value={channel} onValueChange={setChannel}>
                    <SelectTrigger className="font-medium bg-muted/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both"><div className="flex items-center gap-2 font-medium"><Megaphone className="h-3.5 w-3.5 text-primary" /> Both Channels</div></SelectItem>
                      <SelectItem value="telegram"><div className="flex items-center gap-2 font-medium"><MessageCircle className="h-3.5 w-3.5 text-sky-500" /> Telegram Bot</div></SelectItem>
                      <SelectItem value="email"><div className="flex items-center gap-2 font-medium"><Mail className="h-3.5 w-3.5 text-amber-500" /> Email Only</div></SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground leading-relaxed pt-1">
                    Select where the message will be sent.
                  </p>
                </div>

                {/* Target Select */}
                <div className="p-5 space-y-3 bg-card md:col-span-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Users className="h-3 w-3" /> Audience Target
                  </Label>
                  <Select value={target} onValueChange={setTarget}>
                    <SelectTrigger className="font-medium bg-muted/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all"><div className="flex items-center gap-2 font-medium"><Users className="h-3.5 w-3.5 text-blue-500" /> All Registered Customers</div></SelectItem>
                      <SelectItem value="verified"><div className="flex items-center gap-2 font-medium"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Verified Accounts Only</div></SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex justify-between items-center pt-1">
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Choose which segment of users will receive this announcement.
                    </p>
                    {target === 'all' && <Badge variant="secondary" className="text-[9px] bg-red-500/10 text-red-600 dark:text-red-400">Mass Broadcast</Badge>}
                  </div>
                </div>
              </div>

              {/* Message Input */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-bold">Message Content</Label>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border">Supports Markdown / HTML</span>
                </div>
                <Textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hey everyone! We just launched a massive discount for Telegram Premium..."
                  className="min-h-[220px] resize-y bg-muted/10 font-medium text-sm leading-relaxed p-4"
                />
              </div>

              {/* Action */}
              <div className="p-6 bg-muted/5 border-t border-border/50 flex sm:justify-end">
                <Button 
                  size="lg" 
                  onClick={handleSend}
                  disabled={sending || !message.trim()}
                  className="w-full sm:w-auto font-bold h-12 px-8 shadow-xl shadow-primary/20 text-white rounded-xl"
                >
                  {sending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Dispatching to network...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Send Broadcast
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Alert className="mt-6 border-blue-500/20 bg-blue-500/5 text-blue-800 dark:text-blue-300">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-xs font-bold text-blue-700 dark:text-blue-400">Delivery Information</AlertTitle>
            <AlertDescription className="text-[11px] leading-relaxed mt-1">
              Broadcasts are processed asynchronously to avoid rate-limits. If you select Telegram, the system will pause momentarily between sends to respect bot limitations. Users without connected accounts for your selected channel will automatically be skipped.
            </AlertDescription>
          </Alert>

        </motion.div>

      </motion.div>
    </div>
  )
}
