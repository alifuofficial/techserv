'use client'

import { useQuery } from '@tanstack/react-query'

interface PublicSettings {
  site_name?: string
  site_description?: string
  currency?: string
  currency_symbol?: string
  telegram_enabled?: string
  account_tier_enabled?: string
  referral_system_enabled?: string
  registration_enabled?: string
  [key: string]: string | undefined
}

async function fetchSettings(): Promise<PublicSettings> {
  const res = await fetch('/api/settings/public')
  if (!res.ok) return {}
  return res.json()
}

export function useSettings() {
  const { data, isLoading } = useQuery<PublicSettings>({
    queryKey: ['public-settings'],
    queryFn: fetchSettings,
    staleTime: 5 * 60 * 1000, // cache 5 minutes
  })

  const currencySymbol = data?.currency_symbol || '$'
  const currency = data?.currency || 'USD'

  /**
   * Format a number as a currency string, e.g. "ETB 50.00" or "$50.00".
   * Symbols longer than 1 character get a trailing space for readability.
   */
  function formatAmount(amount: number): string {
    const sym = currencySymbol
    const formatted = amount.toFixed(2)
    return sym.length > 1 ? `${sym} ${formatted}` : `${sym}${formatted}`
  }

  return {
    settings: data ?? {},
    isLoading,
    currencySymbol,
    currency,
    formatAmount,
  }
}
