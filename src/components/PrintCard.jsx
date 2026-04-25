import { Button } from './Notify';
import { Printer } from 'lucide-react';

export default function PrintCard({ eq, files, issues }) {
  const handlePrint = () => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>${eq.name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #111; }
            h1 { font-size: 24px; margin-bottom: 4px; }
            .subtitle { color: #666; font-size: 14px; margin-bottom: 24px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
            .field { background: #f8f8f8; border-radius: 8px; padding: 12px; }
            .field-label { font-size: 11px; color: #999; margin-bottom: 4px; }
            .field-value { font-size: 14px; font-weight: 500; }
            h2 { font-size: 16px; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 8px; }
            .issue { background: #fff8f0; border-left: 3px solid #f39c12; padding: 12px; border-radius: 4px; margin-bottom: 8px; }
            .issue-title { font-weight: 600; font-size: 14px; }
            .issue-text { font-size: 13px; color: #666; margin-top: 4px; }
            .file { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px; }
            img { width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 24px; }
            .badge { display: inline-block; background: #e8f0ff; color: #4f7cff; padding: 3px 10px; border-radius: 20px; font-size: 12px; margin-right: 8px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          ${eq.image ? `<img src="${eq.image}" alt="${eq.name}" />` : ''}
          <h1>${eq.name}</h1>
          <div class="subtitle">
            <span class="badge">${eq.category}</span>
            <span class="badge">${eq.status === 'active' ? 'Активен' : eq.status === 'maintenance' ? 'Обслуживание' : 'Списан'}</span>
          </div>

          <div class="grid">
            <div class="field"><div class="field-label">Производитель</div><div class="field-value">${eq.manufacturer || '—'}</div></div>
            <div class="field"><div class="field-label">Модель</div><div class="field-value">${eq.model || '—'}</div></div>
            <div class="field"><div class="field-label">Год</div><div class="field-value">${eq.year || '—'}</div></div>
            <div class="field"><div class="field-label">Серийный №</div><div class="field-value">${eq.serialNumber || '—'}</div></div>
          </div>

          ${eq.description ? `<p style="font-size:14px;color:#555;margin-bottom:24px;line-height:1.6">${eq.description}</p>` : ''}

          ${issues.length > 0 ? `
            <h2>Проблемы и решения (${issues.length})</h2>
            ${issues.map(i => `
              <div class="issue">
                <div class="issue-title">${i.problem}</div>
                ${i.cause ? `<div class="issue-text">Причина: ${i.cause}</div>` : ''}
                ${i.solution ? `<div class="issue-text" style="color:#27ae60">Решение: ${i.solution}</div>` : ''}
              </div>
            `).join('')}
          ` : ''}

          ${files.length > 0 ? `
            <h2 style="margin-top:24px">Документы (${files.length})</h2>
            ${files.map(f => `
              <div class="file">
                <span>${f.name}</span>
                <span style="color:#999">${f.type}</span>
              </div>
            `).join('')}
          ` : ''}

          <p style="margin-top:32px;font-size:12px;color:#999">
            Распечатано: ${new Date().toLocaleDateString('ru-RU')}
          </p>
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <Button variant="secondary" onClick={handlePrint}>
      <Printer size={14} className="inline mr-1" /> Печать
    </Button>
  );
}