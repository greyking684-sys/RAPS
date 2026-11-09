import { jsPDF } from 'jspdf';
import { ShiftReport, MachineRecord } from '../types/oee';
import { aggregateMachines } from './oeeCalculations';

export function formatPc(v: number | null | undefined): string {
  return v == null ? '–' : `${Math.round(v * 100)}%`;
}

export function formatNum(v: number | null | undefined): string {
  return Math.round(v || 0).toLocaleString('en-US');
}

// Generate industrial shift report PDF using jsPDF
export function exportShiftToPdf(report: ShiftReport): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const agg = aggregateMachines(report.ms);

  // Colors
  const navy = [15, 23, 42]; // slate-900
  const blue = [37, 99, 235]; // blue-600
  const lightGray = [241, 245, 249]; // slate-100
  const textDark = [30, 41, 59];
  const textMuted = [100, 116, 139];

  // Header Banner
  doc.setFillColor(navy[0], navy[1], navy[2]);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RIG & PLANT SERVICES', 14, 12);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('OEE & PRODUCTION PERFORMANCE REPORT', 14, 19);

  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth - 14, 19, { align: 'right' });

  // Shift Meta Box
  let y = 35;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.roundedRect(14, y, pageWidth - 28, 18, 2, 2, 'F');

  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`DATE: ${report.date}`, 18, y + 7);
  doc.text(`SHIFT: ${report.shift.toUpperCase()} (${report.hrs} HRS)`, 70, y + 7);
  doc.text(`LEADER: ${report.ld}`, 130, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(`Active Machines: ${report.ms.filter(m => m.st === 'Running').length}/${report.ms.length}`, 18, y + 14);
  doc.text(`Total Downtime: ${agg.dt} mins`, 70, y + 14);
  doc.text(`Report ID: ${report.id}`, 130, y + 14);

  // Overall KPIs Box
  y += 24;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('EXECUTIVE KPI SUMMARY', 14, y);

  y += 4;
  const kpiBoxWidth = (pageWidth - 28 - 15) / 4;
  const kpis = [
    { label: 'PLANT OEE', val: formatPc(agg.oee), highlight: true },
    { label: 'ATTAINMENT', val: formatPc(agg.att), highlight: false },
    { label: 'GOOD OUTPUT', val: formatNum(agg.G), highlight: false },
    { label: 'TOTAL SCRAP', val: `${agg.sc.toFixed(1)} kg`, highlight: false }
  ];

  kpis.forEach((kpi, idx) => {
    const x = 14 + idx * (kpiBoxWidth + 5);
    doc.setFillColor(kpi.highlight ? blue[0] : 248, kpi.highlight ? blue[1] : 250, kpi.highlight ? blue[2] : 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, y, kpiBoxWidth, 16, 2, 2, 'FD');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(kpi.highlight ? 255 : textMuted[0], kpi.highlight ? 255 : textMuted[1], kpi.highlight ? 255 : textMuted[2]);
    doc.text(kpi.label, x + 4, y + 5);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(kpi.highlight ? 255 : textDark[0], kpi.highlight ? 255 : textDark[1], kpi.highlight ? 255 : textDark[2]);
    doc.text(kpi.val, x + 4, y + 12);
  });

  // Machine Breakdown Table
  y += 24;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(navy[0], navy[1], navy[2]);
  doc.text('MACHINE PERFORMANCE BREAKDOWN', 14, y);

  y += 5;
  // Table Header
  doc.setFillColor(navy[0], navy[1], navy[2]);
  doc.rect(14, y, pageWidth - 28, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');

  doc.text('MACHINE', 16, y + 4.8);
  doc.text('DEPT', 52, y + 4.8);
  doc.text('STATUS', 84, y + 4.8);
  doc.text('TARGET', 108, y + 4.8);
  doc.text('ACTUAL', 128, y + 4.8);
  doc.text('ATTAIN', 148, y + 4.8);
  doc.text('OEE', 166, y + 4.8);
  doc.text('DT (M)', 182, y + 4.8);

  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);

  report.ms.forEach((m: MachineRecord, i: number) => {
    const isEven = i % 2 === 0;
    doc.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
    doc.rect(14, y, pageWidth - 28, 6.5, 'F');

    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(m.n, 16, y + 4.5);
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text(m.dept, 52, y + 4.5);

    // Status
    doc.setTextColor(m.st === 'Running' ? 16 : (m.st === 'Idle' ? 220 : 100), m.st === 'Running' ? 149 : (m.st === 'Idle' ? 38 : 116), m.st === 'Running' ? 193 : (m.st === 'Idle' ? 38 : 139));
    doc.text(m.st, 84, y + 4.5);

    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(formatNum(m.target), 108, y + 4.5);
    doc.text(formatNum(m.good), 128, y + 4.5);
    doc.text(formatPc(m.att), 148, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(m.oee && m.oee >= 0.75 ? 16 : (m.oee && m.oee >= 0.5 ? 202 : 220), m.oee && m.oee >= 0.75 ? 149 : (m.oee && m.oee >= 0.5 ? 138 : 38), m.oee && m.oee >= 0.75 ? 193 : 38);
    doc.text(formatPc(m.oee), 166, y + 4.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(m.dt > 0 ? 220 : 100, m.dt > 0 ? 38 : 116, m.dt > 0 ? 38 : 139);
    doc.text(String(m.dt), 182, y + 4.5);

    y += 6.5;
  });

  // Critical Flags & Downtime Causes
  y += 5;
  if (report.flags && report.flags.length > 0) {
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38); // red-600
    doc.text('CRITICAL FLAGS & ALERTS', 14, y);
    y += 4;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    report.flags.forEach((f) => {
      doc.text(`* ${f}`, 16, y);
      y += 4;
    });
    y += 2;
  }

  // Downtime Reasons
  const dtReasons: { machine: string; reason: string }[] = [];
  report.ms.forEach((m) => {
    if (m.causes && m.causes.length > 0) {
      m.causes.forEach((c) => dtReasons.push({ machine: m.n, reason: c }));
    }
  });

  if (dtReasons.length > 0 && y < 240) {
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(navy[0], navy[1], navy[2]);
    doc.text('DOWNTIME LOG & ROOT CAUSES', 14, y);
    y += 4;

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    dtReasons.slice(0, 6).forEach((item) => {
      doc.text(`[${item.machine}] ${item.reason}`, 16, y);
      y += 3.8;
    });
    y += 2;
  }

  // Handover Notes
  if (report.notes && report.notes.length > 0 && y < 255) {
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(navy[0], navy[1], navy[2]);
    doc.text('HANDOVER & OPERATIONAL NOTES', 14, y);
    y += 4;

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    report.notes.slice(0, 4).forEach((n) => {
      doc.text(`* ${n}`, 16, y);
      y += 3.8;
    });
  }

  // Footer
  const footerY = 285;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, footerY - 5, pageWidth - 14, footerY - 5);

  doc.setFontSize(7);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Rig & Plant Services OEE Manufacturing Intelligence Platform', 14, footerY);
  doc.text('Confidential - For Internal Plant Use Only', pageWidth - 14, footerY, { align: 'right' });

  // Download File
  doc.save(`RigPlant_ShiftReport_${report.date}_${report.shift}.pdf`);
}

// Generate formatted WhatsApp Shift Report text
export function exportShiftToWhatsAppText(report: ShiftReport): string {
  const dateFormatted = report.date.split('-').reverse().join('/');
  const shiftTitle = `${report.shift.toUpperCase()} SHIFT PRODUCTION REPORT (${report.hrs} hrs)`;

  let text = `*🏭 RIG & PLANT SERVICES*\n`;
  text += `*${shiftTitle}* *Date*: ${dateFormatted}\n`;
  text += `👤 *Team Leader*: ${report.ld}\n\n`;

  // Group by department
  const depts = ['Cap Compression', 'Blow Moulding', 'Injection', 'Secondary'];
  const deptIcons: Record<string, string> = {
    'Cap Compression': '🔵',
    'Blow Moulding': '🟡',
    'Injection': '🟢',
    'Secondary': '🟣'
  };

  depts.forEach((dept) => {
    const deptMachines = report.ms.filter(m => m.dept === dept);
    if (deptMachines.length === 0) return;

    text += `━━━━━━━━━━━━━━\n`;
    text += `*${deptIcons[dept] || '⚪'} ${dept.toUpperCase()}*\n`;
    text += `━━━━━━━━━━━━━━\n`;

    deptMachines.forEach((m) => {
      text += `*${m.n}*\n`;
      text += `*Status*: ${m.st}\n`;
      if (m.cav) text += `*Cavities*: ${m.cav}\n`;
      text += `*Target*: ${formatNum(m.target)}\n`;
      text += `*Actual*: ${formatNum(m.good)}\n`;
      text += `*Good output*: ${formatNum(m.good)}\n`;
      if (m.scrap > 0) text += `*Rejects*: ${m.scrap} kg\n`;
      if (m.mat > 0) text += `*Material*: ${m.mat}kg\n`;
      text += `*Downtime*: ${m.dt} mins\n`;
      if (m.causes && m.causes.length > 0) {
        m.causes.forEach((c) => {
          text += `> ${c}\n`;
        });
      }
      if (m.hk != null) text += `*Housekeeping*: ${Math.round(m.hk * 100)}%\n`;
      if (m.cm) text += `*Comments*: ${m.cm}\n`;
      text += `\n`;
    });
  });

  if (report.notes && report.notes.length > 0) {
    text += `━━━━━━━━━━━━━━\n`;
    text += `*📝 GENERAL SHIFT NOTES*\n`;
    text += `━━━━━━━━━━━━━━\n`;
    report.notes.forEach(n => {
      text += `• ${n}\n`;
    });
    text += `\n`;
  }

  if (report.flags && report.flags.length > 0) {
    text += `━━━━━━━━━━━━━━\n`;
    text += `*🚩 ATTENTION & FLAGS*\n`;
    text += `━━━━━━━━━━━━━━\n`;
    report.flags.forEach(f => {
      text += `🚩 ${f}\n`;
    });
  }

  return text.trim();
}
