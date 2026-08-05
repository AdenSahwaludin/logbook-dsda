import { ReportService } from './reportService'
import { UserService } from './userService'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
  BorderStyle,
  ImageRun,
  PageBreak
} from 'docx'

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const DAY_NAMES_ID = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
]

async function getImageBuffer(urlStr: string): Promise<Buffer | null> {
  if (!urlStr) return null
  try {
    if (urlStr.startsWith('data:image/')) {
      const parts = urlStr.split(',')
      if (parts[1]) return Buffer.from(parts[1], 'base64')
    } else if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
      const res = await fetch(urlStr)
      if (res.ok) {
        const ab = await res.arrayBuffer()
        return Buffer.from(ab)
      }
    }
  } catch (err) {
    console.error('Failed to load image buffer for export:', err)
  }
  return null
}

export class ExportService {
  static async generatePdfBuffer(userId?: string, startMonth?: number, endMonth?: number, year?: number): Promise<Buffer> {
    let sMonth = Number(startMonth || (new Date().getMonth() + 1))
    let eMonth = Number(endMonth || sMonth)
    if (sMonth > eMonth) {
      const temp = sMonth
      sMonth = eMonth
      eMonth = temp
    }
    const selectedYear = Number(year || new Date().getFullYear())

    let userInfo: any = null
    if (userId) {
      try {
        userInfo = await UserService.getUserById(userId)
      } catch (e) {}
    }

    const reports = await ReportService.getReports('admin', '', userId, sMonth, eMonth, selectedYear)

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    const nama = userInfo?.name || 'Karnadi'
    const jabatan = userInfo?.position || userInfo?.jabatan || 'Teknisi Lapangan Irigasi'
    const lokasiPenempatan = userInfo?.workLocation || userInfo?.lokasiPenempatan || 'UPTD Sumber Daya Air Wilayah II'
    const kabupaten = userInfo?.district || userInfo?.kabupaten || 'Sidoarjo'
    const seksi = userInfo?.section || userInfo?.seksi || 'Seksi Pemeliharaan Jaringan Irigasi'

    for (let m = sMonth; m <= eMonth; m++) {
      if (m > sMonth) {
        doc.addPage('a4', 'landscape')
      }

      const daysInMonth = new Date(selectedYear, m, 0).getDate()
      const monthData = []

      for (let d = 1; d <= daysInMonth; d++) {
        const padDay = String(d).padStart(2, '0')
        const padMonth = String(m).padStart(2, '0')
        const dateStr = `${selectedYear}-${padMonth}-${padDay}`
        const dateObj = new Date(selectedYear, m - 1, d)
        const dayName = DAY_NAMES_ID[dateObj.getDay()]
        const formattedDate = `${padDay} ${MONTH_NAMES_ID[m - 1]} ${selectedYear}`

        const report = reports.find(r => r.date === dateStr)
        let imageBuffer: Buffer | null = null
        if (report && report.photoUrl) {
          imageBuffer = await getImageBuffer(report.photoUrl)
        }

        monthData.push({
          no: d,
          dayName,
          formattedDate,
          dateStr,
          report,
          isFilled: !!report,
          imageBuffer
        })
      }

      // Header Title
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      doc.setTextColor(0, 0, 0)
      doc.text('JURNAL KEGIATAN', 14, 14)

      // Red Warning Text on Top Right
      doc.setFontSize(8.5)
      doc.setTextColor(204, 0, 0)
      doc.text('HARAP ISI NAMA, JABATAN DAN LAINNYA TERLEBIH DAHULU!!', 283, 14, { align: 'right' })

      // User Info Header Block
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(0, 0, 0)

      const monthNameStr = `${MONTH_NAMES_ID[m - 1]}`

      const headerFields = [
        { label: 'Nama', value: nama },
        { label: 'Jabatan', value: jabatan },
        { label: 'Lokasi Penempatan', value: lokasiPenempatan },
        { label: 'Kabupaten', value: kabupaten },
        { label: 'Bulan', value: monthNameStr }
      ]

      let yHeader = 20
      const colLabelX = 14
      const colColonX = 50
      const colValueX = 53

      headerFields.forEach((field, idx) => {
        doc.text(field.label, colLabelX, yHeader)
        doc.text(':', colColonX, yHeader)
        doc.text(field.value, colValueX, yHeader)

        if (idx === 2) {
          doc.text(`SEKSI : ${seksi}`, 165, yHeader)
        }
        yHeader += 4.5
      })

      // Table Setup
      const tableHead = [['No.', 'Hari', 'Tanggal', 'Uraian Kegiatan', 'Output Kegiatan', 'Lokasi Kegiatan', 'Dokumentasi', 'Keterangan']]

      const tableBody = monthData.map(item => {
        const rep = item.report
        const keteranganVal = item.isFilled
          ? (rep.status !== undefined && rep.status !== null && String(rep.status).trim() !== ''
              ? rep.status
              : (rep.description ? rep.description : `SPV.${lokasiPenempatan}`))
          : ''
        return [
          item.no.toString(),
          item.dayName,
          item.formattedDate,
          item.isFilled ? (rep.activity || '') : '',
          item.isFilled ? (rep.output || '') : '',
          item.isFilled ? (rep.location || '') : '',
          '', // Image rendered via didDrawCell
          keteranganVal,
        ]
      })

      autoTable(doc, {
        startY: 44,
        head: tableHead,
        body: tableBody,
        theme: 'grid',
        headStyles: {
          fillColor: [217, 225, 242],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle',
          fontSize: 8.5
        },
        styles: {
          fontSize: 8,
          cellPadding: 1.5,
          valign: 'middle',
          overflow: 'linebreak',
          lineColor: [0, 0, 0],
          lineWidth: 0.15,
          minCellHeight: 12
        },
        columnStyles: {
          0: { cellWidth: 9, halign: 'center' },
          1: { cellWidth: 18, halign: 'center' },
          2: { cellWidth: 32, halign: 'center' },
          3: { cellWidth: 68, halign: 'left' },
          4: { cellWidth: 44, halign: 'left' },
          5: { cellWidth: 40, halign: 'left' },
          6: { cellWidth: 26, halign: 'center' },
          7: { cellWidth: 32, halign: 'left' }
        },
        didParseCell: (data) => {
          if (data.section === 'body') {
            const item = monthData[data.row.index]
            if (item && !item.isFilled) {
              data.cell.styles.fillColor = [204, 0, 0]
              if (data.column.index <= 2) {
                data.cell.styles.textColor = [0, 0, 0]
              } else {
                data.cell.styles.textColor = [204, 0, 0]
              }
            }
          }
        },
        didDrawCell: (data) => {
          if (data.section === 'body' && data.column.index === 6) {
            const item = monthData[data.row.index]
            if (item && item.isFilled && item.imageBuffer) {
              try {
                const base64 = `data:image/jpeg;base64,${item.imageBuffer.toString('base64')}`
                const cellWidth = data.cell.width
                const cellHeight = data.cell.height
                const imgSize = Math.min(cellWidth - 2, cellHeight - 2, 11)
                const x = data.cell.x + (cellWidth - imgSize) / 2
                const y = data.cell.y + (cellHeight - imgSize) / 2
                doc.addImage(base64, 'JPEG', x, y, imgSize, imgSize)
              } catch (e) {
                console.error('Error drawing image thumbnail in PDF cell:', e)
              }
            }
          }
        }
      })
    }

    const arrayBuffer = doc.output('arraybuffer')
    return Buffer.from(arrayBuffer)
  }

  static async generateDocxBuffer(userId?: string, startMonth?: number, endMonth?: number, year?: number): Promise<Buffer> {
    let sMonth = Number(startMonth || (new Date().getMonth() + 1))
    let eMonth = Number(endMonth || sMonth)
    if (sMonth > eMonth) {
      const temp = sMonth
      sMonth = eMonth
      eMonth = temp
    }
    const selectedYear = Number(year || new Date().getFullYear())

    let userInfo: any = null
    if (userId) {
      try {
        userInfo = await UserService.getUserById(userId)
      } catch (e) {}
    }

    const reports = await ReportService.getReports('admin', '', userId, sMonth, eMonth, selectedYear)

    const nama = userInfo?.name || 'Karnadi'
    const jabatan = userInfo?.position || userInfo?.jabatan || 'Teknisi Lapangan Irigasi'
    const lokasiPenempatan = userInfo?.workLocation || userInfo?.lokasiPenempatan || 'UPTD Sumber Daya Air Wilayah II'
    const kabupaten = userInfo?.district || userInfo?.kabupaten || 'Sidoarjo'
    const seksi = userInfo?.section || userInfo?.seksi || 'Seksi Pemeliharaan Jaringan Irigasi'

    const borderless = {
      top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
      right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
    }

    const documentChildren: any[] = []

    for (let m = sMonth; m <= eMonth; m++) {
      if (m > sMonth) {
        documentChildren.push(new Paragraph({ children: [new PageBreak()] }))
      }

      const daysInMonth = new Date(selectedYear, m, 0).getDate()
      const monthData = []

      for (let d = 1; d <= daysInMonth; d++) {
        const padDay = String(d).padStart(2, '0')
        const padMonth = String(m).padStart(2, '0')
        const dateStr = `${selectedYear}-${padMonth}-${padDay}`
        const dateObj = new Date(selectedYear, m - 1, d)
        const dayName = DAY_NAMES_ID[dateObj.getDay()]
        const formattedDate = `${padDay} ${MONTH_NAMES_ID[m - 1]} ${selectedYear}`

        const report = reports.find(r => r.date === dateStr)
        let imageBuffer: Buffer | null = null
        if (report && report.photoUrl) {
          imageBuffer = await getImageBuffer(report.photoUrl)
        }

        monthData.push({
          no: d,
          dayName,
          formattedDate,
          dateStr,
          report,
          isFilled: !!report,
          imageBuffer
        })
      }

      const monthNameStr = `${MONTH_NAMES_ID[m - 1]}`

      const headerTableRows = [
        { label: 'Nama', val: nama },
        { label: 'Jabatan', val: jabatan },
        { label: 'Lokasi Penempatan', val: `${lokasiPenempatan}                  SEKSI : ${seksi}` },
        { label: 'Kabupaten', val: kabupaten },
        { label: 'Bulan', val: monthNameStr }
      ].map(row => new TableRow({
        children: [
          new TableCell({ borders: borderless, width: { size: 22, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: row.label, size: 18 })] })] }),
          new TableCell({ borders: borderless, width: { size: 3, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: ':', size: 18 })] })] }),
          new TableCell({ borders: borderless, width: { size: 75, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: row.val, size: 18 })] })] })
        ]
      }))

      const tableRows = [
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({ shading: { fill: 'D9E1F2' }, children: [new Paragraph({ children: [new TextRun({ text: 'No.', bold: true, color: '000000' })], alignment: AlignmentType.CENTER })], width: { size: 5, type: WidthType.PERCENTAGE } }),
            new TableCell({ shading: { fill: 'D9E1F2' }, children: [new Paragraph({ children: [new TextRun({ text: 'Hari', bold: true, color: '000000' })], alignment: AlignmentType.CENTER })], width: { size: 10, type: WidthType.PERCENTAGE } }),
            new TableCell({ shading: { fill: 'D9E1F2' }, children: [new Paragraph({ children: [new TextRun({ text: 'Tanggal', bold: true, color: '000000' })], alignment: AlignmentType.CENTER })], width: { size: 15, type: WidthType.PERCENTAGE } }),
            new TableCell({ shading: { fill: 'D9E1F2' }, children: [new Paragraph({ children: [new TextRun({ text: 'Uraian Kegiatan', bold: true, color: '000000' })], alignment: AlignmentType.CENTER })], width: { size: 25, type: WidthType.PERCENTAGE } }),
            new TableCell({ shading: { fill: 'D9E1F2' }, children: [new Paragraph({ children: [new TextRun({ text: 'Output Kegiatan', bold: true, color: '000000' })], alignment: AlignmentType.CENTER })], width: { size: 15, type: WidthType.PERCENTAGE } }),
            new TableCell({ shading: { fill: 'D9E1F2' }, children: [new Paragraph({ children: [new TextRun({ text: 'Lokasi Kegiatan', bold: true, color: '000000' })], alignment: AlignmentType.CENTER })], width: { size: 15, type: WidthType.PERCENTAGE } }),
            new TableCell({ shading: { fill: 'D9E1F2' }, children: [new Paragraph({ children: [new TextRun({ text: 'Dokumentasi', bold: true, color: '000000' })], alignment: AlignmentType.CENTER })], width: { size: 7, type: WidthType.PERCENTAGE } }),
            new TableCell({ shading: { fill: 'D9E1F2' }, children: [new Paragraph({ children: [new TextRun({ text: 'Keterangan', bold: true, color: '000000' })], alignment: AlignmentType.CENTER })], width: { size: 8, type: WidthType.PERCENTAGE } })
          ]
        }),
        ...monthData.map(item => {
          const rep = item.report
          const isFilled = item.isFilled
          const shading = isFilled ? undefined : { fill: 'CC0000' }
          const keteranganVal = isFilled
            ? (rep.status !== undefined && rep.status !== null && String(rep.status).trim() !== ''
                ? rep.status
                : (rep.description ? rep.description : `SPV.${lokasiPenempatan}`))
            : ''

          const docxImageCellChildren = (isFilled && item.imageBuffer)
            ? [new Paragraph({ alignment: AlignmentType.CENTER, children: [new ImageRun({ data: item.imageBuffer, transformation: { width: 45, height: 45 } })] })]
            : [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '', color: 'CC0000' })] })]

          return new TableRow({
            children: [
              new TableCell({ shading, children: [new Paragraph({ children: [new TextRun({ text: `${item.no}`, color: '000000' })], alignment: AlignmentType.CENTER })] }),
              new TableCell({ shading, children: [new Paragraph({ children: [new TextRun({ text: item.dayName, color: '000000' })], alignment: AlignmentType.CENTER })] }),
              new TableCell({ shading, children: [new Paragraph({ children: [new TextRun({ text: item.formattedDate, color: '000000' })], alignment: AlignmentType.CENTER })] }),
              new TableCell({ shading, children: [new Paragraph({ children: [new TextRun({ text: isFilled ? (rep.activity || '') : '', color: isFilled ? '000000' : 'CC0000' })] })] }),
              new TableCell({ shading, children: [new Paragraph({ children: [new TextRun({ text: isFilled ? (rep.output || '') : '', color: isFilled ? '000000' : 'CC0000' })] })] }),
              new TableCell({ shading, children: [new Paragraph({ children: [new TextRun({ text: isFilled ? (rep.location || '') : '', color: isFilled ? '000000' : 'CC0000' })] })] }),
              new TableCell({ shading, children: docxImageCellChildren }),
              new TableCell({ shading, children: [new Paragraph({ children: [new TextRun({ text: keteranganVal, color: isFilled ? '000000' : 'CC0000' })] })] })
            ]
          })
        })
      ]

      documentChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: 'JURNAL KEGIATAN',
              bold: true,
              size: 26
            }),
            new TextRun({
              text: '      HARAP ISI NAMA, JABATAN DAN LAINNYA TERLEBIH DAHULU!!',
              bold: true,
              color: 'CC0000',
              size: 16
            })
          ]
        }),
        new Table({
          rows: headerTableRows,
          width: { size: 100, type: WidthType.PERCENTAGE }
        }),
        new Paragraph({ text: '' }),
        new Table({
          rows: tableRows,
          width: { size: 100, type: WidthType.PERCENTAGE }
        })
      )
    }

    const doc = new Document({
      sections: [
        {
          children: documentChildren
        }
      ]
    })

    return await Packer.toBuffer(doc)
  }
}
