import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const exportToPDF = (idCapture) => {
  const reportElement = document.getElementById(`${idCapture}-to-capture`);

  // A4 dimensions in points (pt)
  const a4Width = 595.28;
  const a4Height = 841.89;

  html2canvas(reportElement, {
    scale: 1.2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
  }).then((canvas) => {
    // Initialize PDF with A4 size
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt', // Use points for precise A4 sizing
      format: 'a4',
    });

    // Convert canvas to JPEG with reasonable quality
    const imgData = canvas.toDataURL('image/jpeg', 0.8);

    // Calculate dimensions to fit A4
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Calculate image dimensions to maintain aspect ratio
    const ratio = canvas.width / canvas.height;
    const imgWidth = pageWidth - 40; // Leave 20pt margin on each side
    const imgHeight = imgWidth / ratio;

    let heightLeft = imgHeight;
    let position = 20; // Top margin

    // Add image to pages
    while (heightLeft > 0) {
      pdf.addImage(imgData, 'JPEG', 20, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 40; // Account for margins

      if (heightLeft > 0) {
        pdf.addPage();
        position = 20; // Top margin for new page
      }
    }

    const pdfPreview = pdf.output('bloburl');
    window.open(pdfPreview);
  });
};

export default exportToPDF;
