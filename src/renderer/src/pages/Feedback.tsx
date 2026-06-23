import { useState } from 'react'
import { Send, ThumbsUp, Bug, Lightbulb, Heart, type LucideIcon } from 'lucide-react'

/**
 * Feedback — form pra mandar feedback pro time.
 *
 * Tipos: Bug report, Feature request, General feedback.
 * Campos: tipo (radio), mensagem (textarea), email (opcional).
 */

type FeedbackType = 'bug' | 'feature' | 'general'

const TYPES: { id: FeedbackType; label: string; Icon: LucideIcon; color: string }[] = [
  { id: 'bug', label: 'Bug Report', Icon: Bug, color: '#f87171' },
  { id: 'feature', label: 'Feature Request', Icon: Lightbulb, color: '#fbbf24' },
  { id: 'general', label: 'General Feedback', Icon: Heart, color: '#f472b6' }
]

export function Feedback() {
  const [type, setType] = useState<FeedbackType>('general')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const canSend = message.trim().length >= 10

  const handleSend = () => {
    if (!canSend) return
    // TODO: POST to API
    setSent(true)
  }

  if (sent) {
    return (
      <div className="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
        <div className="flex items-center justify-center h-full px-6">
          <div className="text-center max-w-sm">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(74,222,128,0.12)' }}
            >
              <ThumbsUp size={28} color="#4ade80" strokeWidth={1.75} />
            </div>
            <h2 className="text-tmpl-card-title mb-3" style={{ color: '#f4f4f6' }}>
              Feedback sent!
            </h2>
            <p className="text-tmpl-label leading-[1.6]" style={{ color: '#86868d' }}>
              Thanks for your feedback. We read every message and use it to make KUXY better.
            </p>
            <button
              onClick={() => { setSent(false); setMessage(''); setEmail('') }}
              className="mt-6 h-[38px] px-5 rounded-[9px] text-[13px] font-medium transition-opacity hover:opacity-80"
              style={{ background: '#161619', border: '1px solid #232327', color: '#e8e8ea' }}
            >
              Send another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: 'var(--color-bg)' }}>
      <div className="px-6 pt-[18px] pb-6">
        <div
          className="rounded-[14px] p-[18px]"
          style={{ background: '#141416', border: '1px solid #1f1f22' }}
        >
          <div className="text-tmpl-card-title mb-[18px]" style={{ color: '#f4f4f6' }}>
            Send Feedback
          </div>

          {/* Type selector */}
          <div className="flex gap-[10px] mb-5">
            {TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id)}
                className="flex-1 flex items-center justify-center gap-2 h-[42px] rounded-[10px] text-[13px] font-medium transition-colors"
                style={{
                  background: type === t.id ? `${t.color}1a` : '#161619',
                  border: `1px solid ${type === t.id ? t.color : '#232327'}`,
                  color: type === t.id ? t.color : '#9a9aa0'
                }}
              >
                <t.Icon size={14} color={type === t.id ? t.color : '#6b6b72'} strokeWidth={1.75} />
                {t.label}
              </button>
            ))}
          </div>

          {/* Message */}
          <div className="mb-4">
            <label className="block text-tmpl-body mb-2" style={{ color: '#86868d' }}>
              Message <span style={{ color: '#f87171' }}>*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              placeholder="Tell us what's on your mind... the more detail, the better."
              className="w-full p-3 rounded-[10px] text-[13.5px] resize-none"
              style={{
                background: '#0c0c0e',
                border: '1px solid #1f1f22',
                color: '#e8e8ea',
                outline: 'none',
                lineHeight: 1.6
              }}
            />
            <div className="text-right mt-1">
              <span style={{ color: message.length < 10 ? '#6b6b72' : '#4ade80', fontSize: 11 }}>
                {message.length} / 10 min
              </span>
            </div>
          </div>

          {/* Email (optional) */}
          <div className="mb-6">
            <label className="block text-tmpl-body mb-2" style={{ color: '#86868d' }}>
              Your email <span style={{ color: '#6b6b72', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="reply@example.com"
              className="w-full h-[38px] px-3 rounded-[9px] text-[13.5px]"
              style={{
                background: '#0c0c0e',
                border: '1px solid #1f1f22',
                color: '#e8e8ea',
                outline: 'none'
              }}
            />
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="w-full flex items-center justify-center gap-2 h-[42px] rounded-[10px] text-[13px] font-medium transition-opacity"
            style={{
              background: canSend ? '#8b5cf6' : '#1a1a1d',
              color: canSend ? '#fff' : '#4a4a4e',
              cursor: canSend ? 'pointer' : 'not-allowed'
            }}
          >
            <Send size={14} strokeWidth={1.75} />
            Send Feedback
          </button>
        </div>
      </div>
    </div>
  )
}