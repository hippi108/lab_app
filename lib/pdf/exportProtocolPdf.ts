import jsPDF from 'jspdf';
import type { Protocol } from '@/types/protocol';

export function exportProtocolPdf(protocol: Protocol) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const margin = 20;
  let y = margin;

  const writeLine = (text: string | string[]) => {
    const lines = Array.isArray(text) ? text : doc.splitTextToSize(text, 170);
    doc.text(lines, margin, y);
    y += lines.length * 6;
  };

  doc.setFontSize(18);
  doc.text(protocol.title, margin, y);
  y += 10;
  doc.setFontSize(11);
  writeLine(`概要: ${protocol.description}`);
  y += 2;
  writeLine(`タグ: ${protocol.tags.join(', ')}`);
  y += 2;
  writeLine(`作成日: ${new Date(protocol.createdAt).toLocaleDateString()}`);
  y += 6;

  protocol.blocks.forEach((block) => {
    if (y > 270) {
      doc.addPage();
      y = margin;
    }

    if (block.type === 'heading') {
      doc.setFontSize(13);
      writeLine(block.text);
      y += 4;
    }

    if (block.type === 'text' || block.type === 'note') {
      doc.setFontSize(10);
      const text = block.type === 'note' ? `Note: ${block.text}` : block.text;
      writeLine(text);
      y += 2;
    }

    if (block.type === 'materials') {
      doc.setFontSize(11);
      writeLine(block.title);
      y += 2;
      block.items.forEach((item) => {
        writeLine(`- ${item.name}: ${item.amount}`);
      });
      y += 2;
    }

    if (block.type === 'step') {
      doc.setFontSize(10);
      writeLine(`- ${block.step}`);
      y += 2;
    }

    if (block.type === 'checklist') {
      doc.setFontSize(10);
      block.items.forEach((item) => {
        writeLine(`☐ ${item.text}`);
      });
      y += 2;
    }

    if (block.type === 'calculation') {
      doc.setFontSize(11);
      writeLine(`計算ブロック: ${block.title}`);
      y += 2;
      block.formulas.forEach((formula) => {
        writeLine(`- ${formula.label}: ${formula.expression}`);
      });
      y += 2;
      block.outputs.forEach((output) => {
        writeLine(`- ${output.label}: ${output.unit ?? ''}`);
      });
      y += 2;
    }
  });

  doc.save(`${protocol.title}.pdf`);
}
