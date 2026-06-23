import { useState } from 'react'
import { Search, BookOpen, MessageCircle, ExternalLink, ChevronDown } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * Help Center — FAQ + links úteis.
 *
 * Seções: Search bar, FAQ accordion, Quick links, Keyboard shortcuts.
 */

const FAQS: { q: string; a: string }[] = [
  {
    q: 'How do I add a new habit?',
    a: 'Press ⌘K to open the command palette and type "new habit". Or click the "+" button in the topbar and select "Habit". Give it a name, choose a category, and set your target frequency.'
  },
  {
    q: 'How does the Finance tracking work?',
    a: 'Connect your bank account or add transactions manually. The app categorizes spending automatically and shows your balance flow, spending breakdown, and budget progress in real time.'
  },
  {
    q: 'Can I use the app on my phone?',
    a: 'Yes! KUXY Mobile is available for Android. Your data syncs across devices via your account. Download it from the link in Settings.'
  },
  {
    q: 'How do I cancel my subscription?',
    a: 'Go to Settings → Billing → Cancel Plan. Your access continues until the end of the current billing period. No refunds are provided for partial months.'
  },
  {
    q: 'Is my data stored locally or in the cloud?',
    a: 'By default, your data is stored locally on your device. If you enable cloud sync (coming soon), a encrypted copy is stored in our servers.'
  },
  {
    q: 'How do I export my data?',
    a: 'Go to Settings → Data & Privacy → Export Data. You can export as JSON or CSV. The export includes all habits, finance transactions, and journal entries.'
  }
]

const QUICK_LINKS: { label: string; icon: LucideIcon; href: string }[] = [
  { label: 'Documentation', icon: BookOpen, href: '#' },
  { label: 'Contact Support', icon: MessageCircle, href: '#' }
]

export function Help() {
  const [search, setSearch] = useState('')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const filtered = FAQS.filter(
    (f) =>
      search === '' ||
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      <div className="px-6 pt-[18px] pb-6">
        {/* Search */}
        <div className="relative mb-4">
          <Search
            size={16}
            color="#6a6a70"
            strokeWidth={1.75}
            className="absolute left-3 top-1/2 -translate-y-1/2"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="w-full h-[38px] pl-9 pr-4 rounded-[9px] text-[13px]"
            style={{
              background: '#141416',
              border: '1px solid #1f1f22',
              color: '#e8e8ea',
              outline: 'none'
            }}
          />
        </div>

        {/* Quick links */}
        <div className="flex gap-[14px] mb-4">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon
            return (
              <a
                key={link.label}
                href={link.href}
                className="flex-1 flex items-center justify-center gap-2 h-[50px] rounded-[12px] text-[13px] font-medium transition-opacity hover:opacity-80"
                style={{ background: '#141416', border: '1px solid #1f1f22', color: '#e8e8ea' }}
              >
                <Icon size={16} strokeWidth={1.75} />
                {link.label}
                <ExternalLink size={12} color="#6b6b72" strokeWidth={1.75} />
              </a>
            )
          })}
        </div>

        {/* FAQ */}
        <div
          className="rounded-[14px] p-[18px]"
          style={{ background: '#141416', border: '1px solid #1f1f22' }}
        >
          <div className="text-tmpl-card-title mb-[14px]" style={{ color: '#f4f4f6' }}>
            Frequently Asked Questions
          </div>
          <div className="flex flex-col -mx-[6px]">
            {filtered.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-tmpl-body mb-2" style={{ color: '#86868d' }}>
                  No results for "{search}"
                </div>
                <div className="text-tmpl-label-xs" style={{ color: '#6a6a70' }}>
                  Try a different search term
                </div>
              </div>
            ) : (
              filtered.map((faq, i) => (
                <div key={i}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between py-[13px] text-left"
                    style={{ borderBottom: i === filtered.length - 1 ? 'none' : '1px solid #161618' }}
                  >
                    <span className="text-tmpl-body font-medium pr-4" style={{ color: '#e8e8ea' }}>
                      {faq.q}
                    </span>
                    <ChevronDown
                      size={16}
                      color="#6a6a70"
                      strokeWidth={1.75}
                      className="shrink-0 transition-transform"
                      style={{ transform: openFaq === i ? 'rotate(180deg)' : 'none' }}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="pb-[13px]">
                      <p className="text-tmpl-label leading-[1.6]" style={{ color: '#86868d' }}>
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
