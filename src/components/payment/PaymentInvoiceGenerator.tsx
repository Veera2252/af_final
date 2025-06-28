import React from 'react';
import jsPDF from 'jspdf';
import { useToast } from '@/hooks/use-toast';

interface StudentData {
  full_name: string;
  phone: string;
  address: string;
  profession: string;
  course: string;
  total_fees: number;
  paid_amount: number;
  balance: number;
  email: string;
}

interface PaymentInvoiceGeneratorProps {
  studentData: StudentData;
  courseTitle?: string;
}

export const PaymentInvoiceGenerator: React.FC<PaymentInvoiceGeneratorProps> = ({
  studentData,
  courseTitle
}) => {
  const { toast } = useToast();

  const generatePaymentInvoicePDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;

      // Colors
      const primaryColor = [59, 130, 246]; // Blue
      const secondaryColor = [107, 114, 128]; // Gray
      const accentColor = [16, 185, 129]; // Green
      const warningColor = [245, 158, 11]; // Amber

      // Header Background
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, pageWidth, 45, 'F');

      // Company Logo Area (placeholder)
      doc.setFillColor(255, 255, 255);
      doc.rect(15, 10, 25, 25, 'F');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('AF', 25, 25);

      // Company Name
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('AlphaFly Computer Education', 50, 25);

      // Tagline
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Excellence in Computer Education', 50, 35);

      // Invoice Title
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('PAYMENT INVOICE', pageWidth - 120, 65);

      // Invoice Number and Date
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`;
      doc.text(`Invoice #: ${invoiceNumber}`, pageWidth - 120, 75);
      doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - 120, 85);

      // Company Details
      doc.setFontSize(10);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      const companyDetails = [
        'AlphaFly Computer Education',
        'No 10, K S Complex, Old Bus Stand',
        'Subban Chetty Street, Suppan Ragavan Colony',
        'NRT Nagar, Theni, Tamil Nadu 625531',
        'Phone: 080158 01689',
        'Email: info@alphaflyeducation.com',
        'Website: www.alphaflyeducation.com'
      ];

      let yPos = 55;
      companyDetails.forEach(line => {
        doc.text(line, 20, yPos);
        yPos += 6;
      });

      // Student Details Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Student Details:', 20, 120);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      
      const studentDetails = [
        `Name: ${studentData.full_name}`,
        `Email: ${studentData.email}`,
        `Phone: ${studentData.phone}`,
        `Profession: ${studentData.profession}`,
        `Address: ${studentData.address}`
      ];

      yPos = 135;
      studentDetails.forEach(line => {
        doc.text(line, 20, yPos);
        yPos += 8;
      });

      // Course & Payment Details Table
      const tableStartY = 185;
      
      // Table Header
      doc.setFillColor(240, 240, 240);
      doc.rect(20, tableStartY, pageWidth - 40, 15, 'F');

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Description', 25, tableStartY + 10);
      doc.text('Amount (₹)', pageWidth - 60, tableStartY + 10);

      // Course Row
      doc.setFont('helvetica', 'normal');
      doc.text(courseTitle || 'Course Enrollment', 25, tableStartY + 25);
      doc.text(`₹${studentData.total_fees.toFixed(2)}`, pageWidth - 60, tableStartY + 25);

      // Payment Details
      const paymentY = tableStartY + 45;
      doc.line(20, paymentY, pageWidth - 20, paymentY);

      doc.setFont('helvetica', 'bold');
      doc.text('Course Fee:', pageWidth - 120, paymentY + 15);
      doc.text(`₹${studentData.total_fees.toFixed(2)}`, pageWidth - 60, paymentY + 15);

      doc.text('Amount Paid:', pageWidth - 120, paymentY + 25);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text(`₹${studentData.paid_amount.toFixed(2)}`, pageWidth - 60, paymentY + 25);

      // Balance with conditional styling
      doc.setTextColor(0, 0, 0);
      doc.text('Balance Due:', pageWidth - 120, paymentY + 35);
      
      if (studentData.balance > 0) {
        doc.setTextColor(warningColor[0], warningColor[1], warningColor[2]);
        doc.setFillColor(warningColor[0], warningColor[1], warningColor[2]);
        doc.rect(pageWidth - 80, paymentY + 40, 60, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(`₹${studentData.balance.toFixed(2)}`, pageWidth - 60, paymentY + 50);
      } else {
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.rect(pageWidth - 80, paymentY + 40, 60, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('PAID', pageWidth - 50, paymentY + 50);
      }

      // Payment Status
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Payment Status', 20, paymentY + 80);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      
      const paymentStatus = studentData.balance > 0 ? 'PARTIAL PAYMENT' : 'FULLY PAID';
      const statusColor = studentData.balance > 0 ? warningColor : accentColor;
      
      doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(`Status: ${paymentStatus}`, 20, paymentY + 95);
      
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.setFont('helvetica', 'normal');
      doc.text(`Payment Date: ${new Date().toLocaleDateString('en-IN')}`, 20, paymentY + 105);
      doc.text(`Payment Method: Cash/Online Transfer`, 20, paymentY + 115);

      if (studentData.balance > 0) {
        doc.setTextColor(warningColor[0], warningColor[1], warningColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(`Remaining Balance: ₹${studentData.balance.toFixed(2)}`, 20, paymentY + 125);
      }

      // Terms and Conditions
      const termsY = pageHeight - 80;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Terms & Conditions:', 20, termsY);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      const terms = [
        '• Course fees are non-refundable after 7 days of enrollment',
        '• Students must complete payment within 30 days of enrollment',
        '• Course access will be provided upon full payment completion',
        '• Certificate will be issued only after course completion and full payment'
      ];

      let termsYPos = termsY + 10;
      terms.forEach(term => {
        doc.text(term, 20, termsYPos);
        termsYPos += 6;
      });

      // Footer
      const footerY = pageHeight - 25;
      doc.setFillColor(240, 240, 240);
      doc.rect(0, footerY, pageWidth, 25, 'F');

      doc.setFontSize(9);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text('Thank you for choosing AlphaFly Computer Education!', pageWidth / 2, footerY + 10, { align: 'center' });
      doc.text('For queries, contact us at info@alphaflyeducation.com or call 080158 01689', pageWidth / 2, footerY + 18, { align: 'center' });

      // Save the PDF
      const fileName = `AlphaFly_Payment_Invoice_${studentData.full_name.replace(/\s+/g, '_')}_${invoiceNumber}.pdf`;
      doc.save(fileName);

      toast({
        title: "Invoice Generated",
        description: "Payment invoice has been downloaded successfully.",
      });

      return fileName;

    } catch (error) {
      console.error('Error generating payment invoice:', error);
      toast({
        title: "Error",
        description: "Failed to generate payment invoice. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  return { generatePaymentInvoicePDF };
};