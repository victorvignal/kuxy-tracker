import { useEffect, useState } from 'react'
import {
  Keyboard,
  Globe,
  Bell,
  Palette,
  Shield,
  Database,
  Monitor,
  Smartphone,
  LifeBuoy
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * More — settings extras (atalhos, preferências).
 *
 * Agrupa preferências do app em seções: General, Appearance,
 * Notifications, Data & Privacy, Devices.
 */

type SettingItem = {
  id: string
  label: string
  sub: string
  Icon: LucideIcon
  iconColor: string
  iconBg: string
}

export function More() {
  const [appVersion, setAppVersion] = useState('—')

  useEffect(() => {
    if (typeof window !== 'undefined' && window.api?.update?.getVersion) {
      window.api.update.getVersion().then(setAppVersion).catch(() => {})
    }
  }, [])

  const ITEMS: SettingItem[] = [
    { id: '1', label: 'Keyboard Shortcuts', sub: '⌘K to search, ⌘N new habit, ⌘S save', Icon: Keyboard, iconColor: '#a78bfa', iconBg: 'rgba(167,139,250,0.12)' },
    { id: '2', label: 'Language', sub: 'English (US)', Icon: Globe, iconColor: '#22d3ee', iconBg: 'rgba(34,211,238,0.12)' },
    { id: '3', label: 'Notifications', sub: 'Daily reminder at 9:00 AM', Icon: Bell, iconColor: '#fbbf24', iconBg: 'rgba(251,191,36,0.12)' },
    { id: '4', label: 'Appearance', sub: 'Dark mode, font scale 100%', Icon: Palette, iconColor: '#f472b6', iconBg: 'rgba(244,114,182,0.12)' },
    { id: '5', label: 'Data & Privacy', sub: 'Local storage, no cloud sync', Icon: Shield, iconColor: '#4ade80', iconBg: 'rgba(74,222,128,0.12)' },
    { id: '6', label: 'Currency', sub: 'BRL (R$)', Icon: Database, iconColor: '#60a5fa', iconBg: 'rgba(96,165,250,0.12)' },
    { id: '7', label: 'Desktop App', sub: `v${appVersion} · Windows 10+`, Icon: Monitor, iconColor: '#9a9aa0', iconBg: 'rgba(154,154,160,0.12)' },
    { id: '8', label: 'Mobile App', sub: 'Not connected', Icon: Smartphone, iconColor: '#9a9aa0', iconBg: 'rgba(154,154,160,0.12)' },
    { id: '9', label: 'Help & Support', sub: 'Docs, FAQ, contact', Icon: LifeBuoy, iconColor: '#a78bfa', iconBg: 'rgba(167,139,250,0.12)' }
  ]
  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      <div className="px-6 pt-[18px] pb-6">
        <div
          className="rounded-[14px] p-[18px]"
          style={{ background: '#141416', border: '1px solid #1f1f22' }}
        >
          <div className="text-tmpl-card-title mb-[14px]" style={{ color: '#f4f4f6' }}>
            Preferences
          </div>
          <div className="flex flex-col -mx-[6px]">
            {ITEMS.map((item, i) => (
              <div
                key={item.id}
                className="flex items-center gap-[14px] px-[6px] py-[13px] rounded-[10px] hover:opacity-90 transition-opacity cursor-pointer"
                style={{ borderBottom: i === ITEMS.length - 1 ? 'none' : '1px solid #161618' }}
              >
                <div
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                  style={{ background: item.iconBg }}
                >
                  <item.Icon size={16} color={item.iconColor} strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-tmpl-body" style={{ color: '#e8e8ea' }}>
                    {item.label}
                  </div>
                  <div className="text-tmpl-label-xs" style={{ color: '#6a6a70' }}>
                    {item.sub}
                  </div>
                </div>
                <span className="text-tmpl-label-xs shrink-0" style={{ color: '#6b6b72' }}>
                  ›
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}