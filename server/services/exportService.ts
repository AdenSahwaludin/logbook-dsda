import { ReportService } from './reportService'
import { jsPDF } from 'jspdf'
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, WidthType, AlignmentType } from 'docx'

export class ExportService {
  static async generatePdfBuffer(userId?: string, month?: number, year?: number): Promise<Buffer> {
    const reports = await ReportService.getReports('admin', '', userId, month, year)

    const doc = new jsPDF()
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text('REKAPITULASI JURNAL KEGIATAN HARIAN PEGAWAI', 105, 18, { align: 'center' })
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('DINAS SUMBER DAYA AIR', 105, 25, { align: 'center' })
    doc.line(14, 29, 196, 29)

    let yPos = 38
    reports.forEach((lap, idx) => {
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text(`${idx + 1}. Tanggal: ${lap.day}, ${lap.date} | Pegawai: ${lap.userName}`, 14, yPos)
      yPos += 6

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.text(`Lokasi: ${lap.location}`, 18, yPos)
      yPos += 5

      const uraianLines = doc.splitTextToSize(`Uraian: ${lap.activity}`, 175)
      doc.text(uraianLines, 18, yPos)
      yPos += uraianLines.length * 4.5

      const outputLines = doc.splitTextToSize(`Output: ${lap.output}`, 175)
      doc.text(outputLines, 18, yPos)
      yPos += outputLines.length * 4.5 + 4

      doc.setDrawColor(226, 232, 240)
      doc.line(14, yPos, 196, yPos)
      yPos += 8
    })

    const arrayBuffer = doc.output('arraybuffer')
    return Buffer.from(arrayBuffer)
  }

  static async generateDocxBuffer(userId?: string, month?: number, year?: number): Promise<Buffer> {
    const reports = await ReportService.getReports('admin', '', userId, month, year)

    const rows = [
      new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'No', bold: true })] })], width: { size: 5, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Hari/Tanggal', bold: true })] })], width: { size: 18, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Nama Pegawai', bold: true })] })], width: { size: 20, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Lokasi & Uraian Kegiatan', bold: true })] })], width: { size: 35, type: WidthType.PERCENTAGE } }),
          new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Output Kegiatan', bold: true })] })], width: { size: 22, type: WidthType.PERCENTAGE } }),
        ]
      }),
      ...reports.map((lap, idx) => 
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(`${idx + 1}`)] }),
            new TableCell({ children: [new Paragraph(`${lap.day}, ${lap.date}`)] }),
            new TableCell({ children: [new Paragraph(lap.userName)] }),
            new TableCell({ children: [new Paragraph(`Lokasi: ${lap.location}\n\nUraian: ${lap.activity}`)] }),
            new TableCell({ children: [new Paragraph(lap.output)] }),
          ]
        })
      )
    ]

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: 'REKAPITULASI JURNAL KEGIATAN HARIAN PEGAWAI',
                  bold: true,
                  size: 26
                })
              ]
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: 'DINAS SUMBER DAYA AIR',
                  size: 20
                })
              ]
            }),
            new Paragraph({ text: '' }),
            new Table({
              rows: rows,
              width: { size: 100, type: WidthType.PERCENTAGE }
            })
          ]
        }
      ]
    })

    return await Packer.toBuffer(doc)
  }
}
