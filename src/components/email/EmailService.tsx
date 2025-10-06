import React from 'react';
import { useToast } from '@/hooks/use-toast';

interface EmailCredentials {
  email: string;
  password: string;
  studentName: string;
  courseName?: string;
  totalFees: number;
  paidAmount: number;
  balance: number;
}

export const EmailService = () => {
  const { toast } = useToast();

  const sendCredentialsWithInvoice = async (credentials: EmailCredentials) => {
    try {
      // In a real implementation, this would call your backend API
      // The backend would:
      // 1. Generate the payment invoice PDF
      // 2. Send an email with credentials and attach the invoice
      // 3. Store the email record in the database

      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock email content that would be sent
      const emailContent = {
        to: credentials.email,
        subject: 'Welcome to AlphaFly Computer Education - Login Credentials & Payment Invoice',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">AlphaFly Computer Education</h1>
              <p style="color: #e0e7ff; margin: 10px 0 0 0;">Excellence in Computer Education</p>
            </div>
            
            <div style="padding: 30px; background: #f8fafc;">
              <h2 style="color: #1e293b; margin-bottom: 20px;">Welcome ${credentials.studentName}!</h2>
              
              <p style="color: #475569; line-height: 1.6;">
                Thank you for enrolling with AlphaFly Computer Education. Your account has been created successfully.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                <h3 style="color: #1e293b; margin-top: 0;">Your Login Credentials</h3>
                <p style="margin: 10px 0;"><strong>Email:</strong> ${credentials.email}</p>
                <p style="margin: 10px 0;"><strong>Password:</strong> ${credentials.password}</p>
                <p style="color: #dc2626; font-size: 14px; margin-top: 15px;">
                  <strong>Important:</strong> Please change your password after your first login for security.
                </p>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                <h3 style="color: #1e293b; margin-top: 0;">Payment Summary</h3>
                <p style="margin: 10px 0;"><strong>Course:</strong> ${credentials.courseName || 'Course Enrollment'}</p>
                <p style="margin: 10px 0;"><strong>Total Fees:</strong> ₹${credentials.totalFees.toFixed(2)}</p>
                <p style="margin: 10px 0;"><strong>Amount Paid:</strong> ₹${credentials.paidAmount.toFixed(2)}</p>
                <p style="margin: 10px 0;"><strong>Balance:</strong> 
                  <span style="color: ${credentials.balance > 0 ? '#dc2626' : '#10b981'}; font-weight: bold;">
                    ₹${credentials.balance.toFixed(2)}
                  </span>
                </p>
              </div>
              
              ${credentials.balance > 0 ? `
                <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                  <p style="color: #92400e; margin: 0;">
                    <strong>Pending Payment:</strong> Please complete the remaining payment of ₹${credentials.balance.toFixed(2)} 
                    to get full access to course materials.
                  </p>
                </div>
              ` : `
                <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                  <p style="color: #065f46; margin: 0;">
                    <strong>Payment Complete:</strong> Your payment is complete. You now have full access to all course materials.
                  </p>
                </div>
              `}
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://your-lms-domain.com/login" 
                   style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 12px 30px; 
                          text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  Login to Your Dashboard
                </a>
              </div>
              
              <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e293b; margin-top: 0;">What's Next?</h3>
                <ul style="color: #475569; line-height: 1.6; padding-left: 20px;">
                  <li>Login to your dashboard using the credentials above</li>
                  <li>Complete your profile information</li>
                  <li>Access your course materials and start learning</li>
                  <li>Download the attached payment invoice for your records</li>
                </ul>
              </div>
              
              <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #0369a1; margin-top: 0;">Need Help?</h3>
                <p style="color: #0369a1; margin: 10px 0;">📧 Email: info@alphaflyeducation.com</p>
                <p style="color: #0369a1; margin: 10px 0;">📞 Phone: 080158 01689</p>
                <p style="color: #0369a1; margin: 10px 0;">🕒 Support Hours: Mon-Sat, 9 AM - 6 PM</p>
                <p style="color: #0369a1; margin: 10px 0;">📍 Address: No 10, K S Complex, Old Bus Stand, Theni</p>
              </div>
            </div>
            
            <div style="background: #1e293b; padding: 20px; text-align: center;">
              <p style="color: #94a3b8; margin: 0; font-size: 14px;">
                © 2025 AlphaFly Computer Education. All rights reserved.
              </p>
              <p style="color: #64748b; margin: 5px 0 0 0; font-size: 12px;">
                This email was sent to ${credentials.email}. Please do not reply to this email.
              </p>
            </div>
          </div>
        `,
        attachments: [
          {
            filename: `Payment_Invoice_${credentials.studentName.replace(/\s+/g, '_')}.pdf`,
            content: 'base64-encoded-pdf-content' // In real implementation, this would be the actual PDF
          }
        ]
      };

      console.log('Email would be sent:', emailContent);

      toast({
        title: "Email Sent Successfully",
        description: `Login credentials and payment invoice sent to ${credentials.email}`,
      });

      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Email Failed",
        description: "Failed to send credentials email. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return { sendCredentialsWithInvoice };
};