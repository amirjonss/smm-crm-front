<template>
  <q-btn
    flat
    round
    color="black"
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
import 'svg2pdf.js'
import './Roboto-Regular-normal.js'
import './Roboto-Bold-normal.js'

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

  await doc.svg(svgFromRaw(logoSvgRaw), { x: W / 2 - 40, y: 24, width: 80, height: 11 })

  doc.setFontSize(14)
  doc.setFont(FONT, 'normal', 'normal')

  doc.setTextColor(CYAN.r, CYAN.g, CYAN.b)
  doc.text('Brend:', 18, 48)
  doc.setTextColor(0, 0, 0)
  doc.text(props.selectedProject.name || '', 35, 48)

  doc.setTextColor(CYAN.r, CYAN.g, CYAN.b)
  doc.text('Raqam:', 18, 56)
  doc.setTextColor(0, 0, 0)
  doc.text(props.selectedProject.phone || '', 37, 56)

  doc.setTextColor(CYAN.r, CYAN.g, CYAN.b)
  doc.text('F.I.O:', W - 78, 48)
  doc.setTextColor(0, 0, 0)
  doc.text(getFullName(props.selectedProject) || '', W - 62, 48)

  doc.setDrawColor(NAVY.r, NAVY.g, NAVY.b)
  doc.setLineWidth(0.5)
  doc.line(18, 64, W - 18, 64)

  doc.setTextColor(NAVY.r, NAVY.g, NAVY.b)
  doc.setFontSize(30)
  doc.setFont(FONT, 'normal', '400')
  doc.text('KONTENT PLAN', W / 2, 82, { align: 'center' })

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
    startY: 94, // под заголовком как в макете
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
      1: { cellWidth: tableWidth * 0.38 }, // Post
      2: { cellWidth: tableWidth * 0.15 }, // Format
      3: { cellWidth: tableWidth * 0.20 }, // Idea
      4: { cellWidth: tableWidth * 0.2, halign: 'center' }, // Sana
    },
    didParseCell: (data) => {
      data.cell.styles.font = FONT
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
