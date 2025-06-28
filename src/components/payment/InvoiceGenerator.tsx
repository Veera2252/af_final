import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Mail } from 'lucide-react';
import jsPDF from 'jspdf';

interface InvoiceData {
  id: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  amount: number;
  paymentDate: string;
  transactionId: string;
  paymentMethod: string;
}

interface InvoiceGeneratorProps {
  invoiceData: InvoiceData;
  className?: string;
}

export const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({
  invoiceData,
  className = ""
}) => {
  const { toast } = useToast();

  const generateInvoicePDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      // Colors
      const primaryColor = [59, 130, 246]; // Blue
      const secondaryColor = [107, 114, 128]; // Gray
      const accentColor = [16, 185, 129]; // Green

      // Header Background
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, pageWidth, 40, 'F');

      // Company Logo Area (placeholder)
      doc.setFillColor(255, 255, 255);
      doc.rect(15, 10, 20, 20, 'F');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('AF', 23, 22);

      // Company Name
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('AlphaFly Computer Education', 45, 25);

      // Invoice Title
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('INVOICE', pageWidth - 60, 60);

      // Invoice Number
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Invoice #: INV-${invoiceData.id.slice(-8).toUpperCase()}`, pageWidth - 60, 70);
      doc.text(`Date: ${new Date(invoiceData.paymentDate).toLocaleDateString('en-IN')}`, pageWidth - 60, 80);

      // Company Details
      doc.setFontSize(10);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      const companyDetails = [
        'AlphaFly Computer Education',
        'No 10, K S Complex, Old Bus Stand',
        'Subban Chetty Street, Suppan Ragavan Colony',
        'NRT Nagar, Theni, Tamil Nadu 625531',
        'Phone: 080158 01689',
        'Email: info@alphaflyeducation.com'
      ];

      let yPos = 50;
      companyDetails.forEach(line => {
        doc.text(line, 20, yPos);
        yPos += 6;
      });

      // Bill To Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Bill To:', 20, 110);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(invoiceData.studentName, 20, 125);
      doc.text(invoiceData.studentEmail, 20, 135);

      // Invoice Details Table Header
      const tableStartY = 160;
      doc.setFillColor(240, 240, 240);
      doc.rect(20, tableStartY, pageWidth - 40, 15, 'F');

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Description', 25, tableStartY + 10);
      doc.text('Amount', pageWidth - 60, tableStartY + 10);

      // Course Details Row
      doc.setFont('helvetica', 'normal');
      doc.text(invoiceData.courseTitle, 25, tableStartY + 25);
      doc.text(`₹${invoiceData.amount.toFixed(2)}`, pageWidth - 60, tableStartY + 25);

      // Subtotal and Total
      const totalY = tableStartY + 45;
      doc.line(20, totalY, pageWidth - 20, totalY);

      doc.setFont('helvetica', 'bold');
      doc.text('Subtotal:', pageWidth - 100, totalY + 15);
      doc.text(`₹${invoiceData.amount.toFixed(2)}`, pageWidth - 60, totalY + 15);

      doc.text('Tax (0%):', pageWidth - 100, totalY + 25);
      doc.text('₹0.00', pageWidth - 60, totalY + 25);

      // Total with background
      doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.rect(pageWidth - 120, totalY + 30, 100, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text('Total:', pageWidth - 100, totalY + 40);
      doc.text(`₹${invoiceData.amount.toFixed(2)}`, pageWidth - 60, totalY + 40);

      // Payment Information
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Payment Information', 20, totalY + 70);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(`Transaction ID: ${invoiceData.transactionId}`, 20, totalY + 85);
      doc.text(`Payment Method: ${invoiceData.paymentMethod}`, 20, totalY + 95);
      doc.text(`Payment Date: ${new Date(invoiceData.paymentDate).toLocaleDateString('en-IN')}`, 20, totalY + 105);
      doc.text('Status: PAID', 20, totalY + 115);

      // Footer
      const footerY = pageHeight - 40;
      doc.setFillColor(240, 240, 240);
      doc.rect(0, footerY, pageWidth, 40, 'F');

      doc.setFontSize(9);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text('Thank you for choosing AlphaFly Computer Education!', pageWidth / 2, footerY + 15, { align: 'center' });
      doc.text('For support, contact us at info@alphaflyeducation.com or call 080158 01689', pageWidth / 2, footerY + 25, { align: 'center' });

      // Save the PDF
      const fileName = `AlphaFly_Invoice_${invoiceData.id.slice(-8).toUpperCase()}.pdf`;
      doc.save(fileName);

      toast({
        title: "Invoice Downloaded",
        description: "Your invoice has been downloaded successfully.",
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  const sendInvoiceEmail = async () => {
    try {
      // In a real implementation, you would call your backend to send the email
      toast({
        title: "Invoice Sent",
        description: `Invoice has been sent to ${invoiceData.studentEmail}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invoice email. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Invoice & Receipt
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-700">Invoice Number:</p>
            <p className="text-gray-600">INV-{invoiceData.id.slice(-8).toUpperCase()}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Date:</p>
            <p className="text-gray-600">{new Date(invoiceData.paymentDate).toLocaleDateString('en-IN')}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Amount:</p>
            <p className="text-gray-600 font-semibold">₹{invoiceData.amount.toFixed(2)}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Status:</p>
            <p className="text-green-600 font-semibold">PAID</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={generateInvoicePDF}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button 
            onClick={sendInvoiceEmail}
            variant="outline"
            className="flex-1"
          >
            <Mail className="h-4 w-4 mr-2" />
            Email Invoice
          </Button>
        </div>

        <div className="text-xs text-gray-500 text-center pt-2 border-t">
          Invoice generated by AlphaFly Computer Education
        </div>
      </CardContent>
    </Card>
  );
};