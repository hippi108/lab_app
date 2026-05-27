import jsPDF from 'jspdf';
import type { Protocol } from '@/types/protocol';

export function exportProtocolPdf(protocol: Protocol) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 20;
  let y = margin;
  doc.setFontSize(18);
  doc.text(protocol.title, margin, y);
  y += 10;
  doc.setFontSize(11);
  doc.text(`概要: ${protocol.description}`, margin, y);
  y += 10;
  doc.text(`タグ: ${protocol.tags.join(', ')}`, margin, y);
  y += 8;
  doc.text(`作成日: ${new Date(protocol.createdAt).toLocaleDateString()}`, margin, y);
  y += 12;
  protocol.blocks.forEach((block) => {
    if (block.type === 'heading') {
      doc.setFontSize(13);
      doc.text(block.text, margin, y);
      y += 8;
    }
    if (block.type === 'text' || block.type === 'note') {
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(block.type === 'note' ? `Note: ${block.text}` : block.text, 170);
      doc.text(lines, margin, y);
      y += lines.length * 6;
    }
    if (block.type === 'materials') {
      doc.setFontSize(11);
      doc.text(block.title, margin, y);
      y += 8;
      block.items.forEach((item) => {
        doc.text(`- ${item.name}: ${item.amount}`, margin + 4, y);
        y += 6;
      });
      y += 4;
    }
    if (block.type === 'step') {
      doc.setFontSize(10);
      doc.text(`- ${block.step}`, margin, y);
      y += 6;
    }
    if (block.type === 'checklist') {
      doc.setFontSize(10);
      block.items.forEach((item) => {
        doc.text(`☐ ${item.text}`, margin, y);
        y += 6;
      });
      y += 4;
    }
    if (y > 270) {
      doc.addPage();
      y = margin;
    }
  });
  doc.save(`${protocol.title}.pdf`);
}
