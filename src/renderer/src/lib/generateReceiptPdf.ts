// KUXY renderer — generateReceiptPdf
// Gera um PDF A4 do recibo com base nos dados do form.

import { jsPDF } from 'jspdf'

type LineItem = {
  id: string
  description: string
  hours: number
  rate: number
}

type ReceiptData = {
  client: string
  items: LineItem[]
  subtotal: number
  tax: number
  total: number
  date: string
  due: string
  receiptNumber?: string
  brandName?: string
  brandTagline?: string
  taxLabel?: string
  taxRate?: number
  footerPrefix?: string
}

/**
 * Formata número como BRL: 1234.5 → "1.234,50"
 */
function fmtBRL(n: number): string {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * Gera o PDF do recibo. Retorna o doc (caller faz .save()).
 */
export function buildReceiptPdf(data: ReceiptData): jsPDF {
  const {
    client,
    items,
    subtotal,
    tax,
    total,
    date,
    due,
    receiptNumber = '#0043',
    brandName = 'KUXY',
    brandTagline = 'Recibo de serviço',
    taxLabel = 'ISS (6%)',
    taxRate = 6,
    footerPrefix = 'Gerado via KUXY',
  } = data

  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth() // 210mm
  const pageHeight = doc.internal.pageSize.getHeight() // 297mm
  const margin = 20
  let y = margin

  // === HEADER ===
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(10, 10, 15)
  doc.text(brandName, margin, y + 6)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(106, 106, 112)
  doc.text(brandTagline, margin, y + 11)

  // número do recibo à direita
  doc.setFontSize(9)
  doc.text('Recibo', pageWidth - margin, y, { align: 'right' })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(10, 10, 15)
  doc.text(receiptNumber, pageWidth - margin, y + 6, { align: 'right' })

  y += 20

  // === CLIENTE + DATAS ===
  doc.setDrawColor(212, 212, 216)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageWidth - margin, y)

  y += 8

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(106, 106, 112)
  doc.text('PARA', margin, y)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(10, 10, 15)
  doc.text(client || '—', margin, y + 5)

  // datas à direita
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(106, 106, 112)
  doc.text('DATA', pageWidth - margin, y, { align: 'right' })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(10, 10, 15)
  doc.text(date, pageWidth - margin, y + 5, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(106, 106, 112)
  doc.text('VENCIMENTO', pageWidth - margin, y + 13, { align: 'right' })
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(10, 10, 15)
  doc.text(due, pageWidth - margin, y + 18, { align: 'right' })

  y += 25

  // === TABELA ===
  // header da tabela
  doc.setDrawColor(26, 26, 29)
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageWidth - margin, y)
  y += 5

  const colDesc = margin
  const colHours = pageWidth - margin - 80
  const colRate = pageWidth - margin - 40
  const colTotal = pageWidth - margin

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(106, 106, 112)
  doc.text('DESCRIÇÃO', colDesc, y)
  doc.text('HORAS', colHours, y, { align: 'right' })
  doc.text('VALOR/H', colRate, y, { align: 'right' })
  doc.text('TOTAL', colTotal, y, { align: 'right' })

  y += 4
  doc.line(margin, y, pageWidth - margin, y)

  y += 5

  // linhas
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(58, 58, 64)

  const maxItems = 12
  const displayItems = items.slice(0, maxItems)

  for (const item of displayItems) {
    if (y > pageHeight - 60) break // não deixa estourar a página

    doc.setTextColor(10, 10, 15)
    doc.text(item.description || '—', colDesc, y, { maxWidth: 100 })
    doc.setTextColor(58, 58, 64)
    doc.text(String(item.hours), colHours, y, { align: 'right' })
    doc.text(`R$ ${fmtBRL(item.rate)}`, colRate, y, { align: 'right' })

    doc.setFont('helvetica', 'bold')
    doc.setTextColor(10, 10, 15)
    doc.text(`R$ ${fmtBRL(item.hours * item.rate)}`, colTotal, y, { align: 'right' })
    doc.setFont('helvetica', 'normal')

    y += 6
    doc.setDrawColor(228, 228, 231)
    doc.setLineWidth(0.1)
    doc.line(margin, y - 1, pageWidth - margin, y - 1)
  }

  if (items.length > maxItems) {
    doc.setFontSize(8)
    doc.setTextColor(154, 154, 160)
    doc.text(
      `+${items.length - maxItems} ${items.length - maxItems === 1 ? 'item' : 'itens'}`,
      pageWidth / 2,
      y + 2,
      { align: 'center' }
    )
    y += 8
  }

  y += 5

  // === TOTAIS ===
  doc.setDrawColor(26, 26, 29)
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageWidth - margin, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(58, 58, 64)

  doc.text('Subtotal', margin, y)
  doc.text(`R$ ${fmtBRL(subtotal)}`, colTotal, y, { align: 'right' })
  y += 6

  doc.text(`${taxLabel} (${taxRate}%)`, margin, y)
  doc.text(`R$ ${fmtBRL(tax)}`, colTotal, y, { align: 'right' })
  y += 4

  doc.setDrawColor(212, 212, 216)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageWidth - margin, y)
  y += 6

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(10, 10, 15)
  doc.text('Total', margin, y)
  doc.text(`R$ ${fmtBRL(total)}`, colTotal, y, { align: 'right' })

  // === FOOTER ===
  const footerY = pageHeight - margin
  doc.setDrawColor(228, 228, 231)
  doc.setLineWidth(0.2)
  doc.line(margin, footerY - 8, pageWidth - margin, footerY - 8)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(154, 154, 160)
  doc.text(`${footerPrefix} · ${date}`, pageWidth / 2, footerY - 3, { align: 'center' })

  return doc
}

/**
 * Helper: gera + salva PDF direto. Retorna o nome do arquivo gerado.
 */
export function generateAndSaveReceiptPdf(data: ReceiptData): string {
  const doc = buildReceiptPdf(data)
  // nome: recibo_NNN_client_YYYY-MM-DD.pdf
  const safeClient = (data.client || 'cliente').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)
  const safeDate = (data.date || 'data').replace(/\//g, '-').replace(/\s/g, '')
  const filename = `recibo_${data.receiptNumber || '0043'}_${safeClient}_${safeDate}.pdf`
  doc.save(filename)
  return filename
}
