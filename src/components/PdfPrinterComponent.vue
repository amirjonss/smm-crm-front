<template>
  <q-btn
    flat
    round
    :color="themeStore.isDark ? 'white' : 'black'"
    icon="picture_as_pdf"
    v-if="selectedProjectId"
    @click="printPage"
  />
</template>
<script setup>
import jsPDF from 'jspdf'
import bgSvgRaw from 'assets/asset7.svg?raw'
import logoSvgRaw from 'assets/logo.svg?raw'
import autoTable from 'jspdf-autotable'
import { defineProps } from 'vue'
import { useThemeStore } from 'stores/theme.js'
import 'svg2pdf.js'
import './Roboto-Regular-normal.js'
import './Roboto-Bold-normal.js'

const themeStore = useThemeStore()
const props = defineProps({
  selectedProjectId: {
    default: null
  },
  selectedProject: {
    default: null
  },
  contentPlans: {
    default: null
  }
})

function getFullName(project) {
  let givenName = project.createdBy.givenName
  let familyName = null
  if (project.createdBy.familyName) {
    familyName = project.createdBy.familyName
  } else {
    familyName = ''
  }
  return givenName + ' ' + familyName
}

function svgFromRaw(raw) {
  const div = document.createElement('div')
  div.innerHTML = raw.trim()
  const svg = div.querySelector('svg')
  if (!svg) throw new Error('SVG not found')
  if (!svg.getAttribute('viewBox')) {
    const w = parseFloat(svg.getAttribute('width')) || 1000
    const h = parseFloat(svg.getAttribute('height')) || 1414
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
  }
  return svg
}

async function printPage() {
  const NAVY = { r: 31, g: 42, b: 90 } // #1F2A5A
  const CYAN = { r: 0, g: 188, b: 212 } // #00BCD4

  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const FONT = 'Roboto-Regular'
  const FONT_BOLD = 'Roboto-Bold'
  doc.setFont(FONT, 'normal')

  const W = doc.internal.pageSize.getWidth()
  const H = doc.internal.pageSize.getHeight()

  await doc.svg(svgFromRaw(bgSvgRaw), { x: 0, y: 0, width: W, height: H })

  await doc.svg(svgFromRaw(logoSvgRaw), { x: W / 2 - 40, y: 5, width: 80, height: 11 })

  doc.setFontSize(14)
  doc.setFont(FONT, 'normal', 'normal')

  doc.setTextColor(CYAN.r, CYAN.g, CYAN.b)
  doc.text('Brend:', 18, 29)
  doc.setTextColor(0, 0, 0)
  doc.text(props.selectedProject.name || '', 35, 29)

  doc.setTextColor(CYAN.r, CYAN.g, CYAN.b)
  doc.text('Raqam:', 18, 37)
  doc.setTextColor(0, 0, 0)
  doc.text(props.selectedProject.phone || '', 37, 56 - 19)

  doc.setTextColor(CYAN.r, CYAN.g, CYAN.b)
  doc.text('F.I.O:', W - 78, 29)
  doc.setTextColor(0, 0, 0)
  doc.text(getFullName(props.selectedProject) || '', W - 62, 29)

  doc.setDrawColor(NAVY.r, NAVY.g, NAVY.b)
  doc.setLineWidth(0.5)
  doc.line(18, 45, W - 18, 45)

  doc.setTextColor(NAVY.r, NAVY.g, NAVY.b)
  doc.setFontSize(30)
  doc.setFont(FONT, 'normal', '400')
  doc.text('KONTENT PLAN', W / 2, 63, { align: 'center' })

  const TARGET_W = 300
  const maxAllowed = W - 2 * 18
  const tableWidth = Math.min(TARGET_W, maxAllowed)
  const left = (W - tableWidth) / 2

  const head = [['№', 'Post', 'Format', 'Idea', 'Sana']]
  const body = props.contentPlans.map((item, i) => [
    String(i + 1),
    item.post || '',
    item.format || '',
    item.idea || '',
    item.date.slice(0, 10) || '',
  ])

  autoTable(doc, {
    head,
    body,
    startY: 94 - 19, // под заголовком как в макете
    tableWidth,
    margin: { left, right: left },
    theme: 'grid',
    styles: {
      fontSize: 10,
      cellPadding: 3.2,
      lineWidth: 0.28,
      lineColor: [NAVY.r, NAVY.g, NAVY.b],
      textColor: [0, 0, 0],
      overflow: 'linebreak',
      valign: 'middle',
    },
    headStyles: {
      font: FONT_BOLD,
      fontStyle: 'normal',
      fontSize: 13,
      fillColor: [NAVY.r, NAVY.g, NAVY.b],
      textColor: [255, 255, 255],
      lineColor: [NAVY.r, NAVY.g, NAVY.b],
      halign: 'center',
    },
    // Доли ширины колонок подобраны под картинку
    columnStyles: {
      0: { cellWidth: tableWidth * 0.07, halign: 'center' }, // №
      1: { cellWidth: tableWidth * 0.20 }, // Post
      2: { cellWidth: tableWidth * 0.15 }, // Format
      3: { cellWidth: tableWidth * 0.38 }, // Idea
      4: { cellWidth: tableWidth * 0.2, halign: 'center' }, // Sana
    },
    didParseCell: (data) => {
      data.cell.styles.font = FONT
      if (data.section === 'body' && data.column.index === 3) {
        // Hide default text by making it white (assumes white background)
        // We will redraw it manually in didDrawCell to handle mixed styles
        data.cell.styles.textColor = [255, 255, 255]
      }
    },
    didDrawCell: (data) => {
      if (data.section === 'body' && data.column.index === 3) {
        const lines = data.cell.text
        const fontSize = data.cell.styles.fontSize
        const scaleFactor = doc.internal.scaleFactor
        const lineHeight = (fontSize * 1.15) / scaleFactor

        // Calculate vertical centering
        const totalTextHeight = lines.length * lineHeight
        // data.cell.y is top-left. data.cell.height is full cell height.
        // We center the text block vertically.
        const startY = data.cell.y + (data.cell.height - totalTextHeight) / 2
        const startX = data.cell.x + data.cell.padding('left')

        const urlRegex = /(https?:\/\/[^\s]+)/g

        lines.forEach((line, i) => {
          // Calculate baseline for the current line
          // Text is drawn from baseline. We approximate baseline from top of line.
          const lineTopY = startY + i * lineHeight
          const textBaselineY = lineTopY + (fontSize * 0.75) / scaleFactor

          // Split line by URL
          const parts = line.split(urlRegex)
          let currentLineX = startX

          parts.forEach((part) => {
            if (!part) return

            if (part.match(/^https?:\/\//)) {
              // It's a link
              doc.setTextColor(0, 0, 255) // Blue
              doc.text(part, currentLineX, textBaselineY)

              const partWidth = doc.getTextWidth(part)

              // Underline
              doc.setDrawColor(0, 0, 255)
              doc.setLineWidth(0.1)
              doc.line(currentLineX, textBaselineY + 0.5, currentLineX + partWidth, textBaselineY + 0.5)

              // Clickable Area
              doc.link(currentLineX, lineTopY, partWidth, lineHeight, { url: part })

              currentLineX += partWidth
            } else {
              // Normal Text
              doc.setTextColor(0, 0, 0) // Black
              doc.text(part, currentLineX, textBaselineY)
              currentLineX += doc.getTextWidth(part)
            }
          })
        })
      }
    },
    didDrawPage: () => {
      // Футер как в макете
      doc.setTextColor(0, 0, 0)
      doc.setFontSize(11)
      doc.text('@kh.agency', 18, H - 12)
      doc.text('+998 20 010 20 20', W - 18, H - 12, { align: 'right' })
    },
    pageBreak: 'auto',
    rowPageBreak: 'auto',
    // Чуть уменьшаем высоту строк, чтобы визуально совпало
    bodyStyles: { minCellHeight: 10.2 },
  })

  doc.save(`${props.selectedProject.project || 'project'}_content_plan.pdf`)
}
</script>
<style scoped></style>
