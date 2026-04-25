import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Modal from './Modal';
import { Button } from './Notify';
import { Printer, Download } from 'lucide-react';

export default function QRModal({ equipment, onClose }) {
  const printRef = useRef();
  const url = `${window.location.origin}/equipment/${equipment._id}`;

  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <html>
        <head>
          <title>QR - ${equipment.name}</title>
          <style>
            body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #fff; }
            .card { border: 2px solid #eee; border-radius: 12px; padding: 32px; text-align: center; max-width: 320px; }
            h2 { font-size: 20px; margin: 16px 0 4px; }
            p { color: #666; font-size: 14px; margin: 4px 0; }
            .badge { display: inline-block; background: #f0f4ff; color: #4f7cff; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-top: 8px; }
          </style>
        </head>
        <body>
          <div class="card">
            ${content}
            <h2>${equipment.name}</h2>
            <p>${equipment.manufacturer || ''} ${equipment.model || ''}</p>
            <p>${equipment.serialNumber ? 'S/N: ' + equipment.serialNumber : ''}</p>
            <span class="badge">${equipment.category}</span>
          </div>
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const handleDownload = () => {
  const svg = printRef.current.querySelector('svg');
  const svgData = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  const img = new Image();
  img.onload = () => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 256, 256);
    ctx.drawImage(img, 0, 0, 256, 256);
    URL.revokeObjectURL(url);

    const a = document.createElement('a');
    a.download = `qr-${equipment.name}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };
  img.src = url;
};

  return (
    <Modal title={`QR код — ${equipment.name}`} onClose={onClose}>
      <div className="flex flex-col items-center gap-6">
        <div ref={printRef} className="bg-white p-4 rounded-xl">
          <QRCodeSVG
            value={url}
            size={200}
            bgColor="#ffffff"
            fgColor="#0f1117"
            level="H"
          />
        </div>

        <div className="text-center">
          <p className="text-sm text-[#8b90a8] mb-1">Ссылка на оборудование:</p>
          <p className="text-xs text-[#4f7cff] break-all">{url}</p>
        </div>

        <div className="flex gap-3 w-full">
          <Button variant="secondary" onClick={handlePrint} className="flex-1">
            <Printer size={14} className="inline mr-1" /> Печать
          </Button>
          <Button onClick={handleDownload} className="flex-1">
            <Download size={14} className="inline mr-1" /> Скачать PNG
          </Button>
        </div>
      </div>
    </Modal>
  );
}