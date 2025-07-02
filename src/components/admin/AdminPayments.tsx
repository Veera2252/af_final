import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, CreditCard, Calendar, DollarSign, FileText, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';


(jsPDF as unknown as { API: { autoTable: typeof autoTable } }).API.autoTable = autoTable;

interface Payment {
  id: string;
  student_id: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
  invoiceNumber: string;
  profiles?: {
    id: string;
    full_name: string;
    email: string;
  };
  courses?: {
    id: string;
    title: string;
    thumbnail_url?: string;
  };
}



const AdminPayments: React.FC = () => {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [studentName, setStudentName] = useState('');
  const [paidAmount, setPaidAmount] = useState('');

const fetchPayments = async () => {
  setLoading(true);

  const { data, error } = await supabase
    .from('payments')
    .select(`*, courses (id, title, thumbnail_url), profiles:student_id (id, full_name, email)`)
    .in('status', ['completed', 'pending', 'failed'])
    .order('created_at', { ascending: false });

  console.log("Raw payment data:", data); // <- debug log

  if (!error && data) {
    const enriched = data.map((p, i) => ({
      ...p,
      invoiceNumber: `INV-2024-${String(i + 1).padStart(3, '0')}`,
      status: p.status as 'completed' | 'pending' | 'failed',
    }));
    setPayments(enriched);
  } else {
    toast({ title: 'Error', description: 'Failed to fetch payments.', variant: 'destructive' });
  }

  setLoading(false);
};


  useEffect(() => {
    fetchPayments();
  }, []);

  const handleManualPayment = async () => {
    const { data: studentProfile, error } = await supabase
      .from('profiles')
      .select('id, full_name, course_id, fees')
      .ilike('full_name', `%${studentName.trim()}%`)
      .single();

    if (error || !studentProfile || typeof studentProfile.fees === 'undefined' || typeof studentProfile.course_id === 'undefined') {
      toast({ title: 'Student Not Found', description: 'Check the name and ensure the student profile has course and fees information.', variant: 'destructive' });
      return;
    }

    const paid = Number(paidAmount);
    const totalFees = Number(studentProfile.fees);
    const balance = totalFees - paid;

    const { error: insertError } = await supabase.from('payments').insert({
      student_id: studentProfile.id,
      course_id: studentProfile.course_id,
      amount: paid,
      status: balance > 0 ? 'pending' : 'completed' || 'pending',
      method: 'manual',
      paid_on: new Date().toISOString(),
    });

    if (insertError) {
      toast({ title: 'Insert Error', description: insertError.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Manual payment recorded.' });
      setStudentName('');
      setPaidAmount('');
      fetchPayments();
    }
  };

  const getStatusBadge = (status: Payment['status']) => {
  const variants = {
    completed: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    failed: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <Badge className={variants[status] ?? 'bg-gray-200 text-gray-800'}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
    </Badge>
  );
};

  const downloadInvoice = (payment: Payment) => {
    try {
      const doc = new jsPDF();
      const amount = Number(payment.amount).toFixed(2);
      const studentName = payment.profiles?.full_name || 'Unknown';
      const courseName = payment.courses?.title || 'Course';

      doc.setFontSize(22);
      doc.text('INVOICE', 14, 18);
      doc.setFontSize(12);
      doc.text('AlphaFly Computer Education', 14, 28);
      doc.text('KS Complex, Theni', 14, 34);
      doc.text('Phone: +91 8015 8016 89', 14, 40);
      doc.text('Date: ' + new Date(payment.created_at).toLocaleDateString(), 150, 28);
      doc.text('Invoice #: ' + payment.invoiceNumber, 150, 34);
      doc.line(14, 44, 196, 44);

      doc.setFontSize(14);
      doc.text('Bill To:', 14, 52);
      doc.setFontSize(12);
      doc.text(studentName, 14, 58);
      doc.text('Course: ' + courseName, 14, 64);

      autoTable(doc, {
        startY: 74,
        head: [['Description', 'Amount (INR)']],
        body: [[courseName, `₹${amount}`]],
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 12 },
      });

      const finalY = (doc as any).lastAutoTable?.finalY || 104;
      doc.setFontSize(12);
      doc.text('Status: ' + payment.status.toUpperCase(), 14, finalY + 12);
      doc.text('Thank you for your business!', 14, finalY + 22);
      doc.save(`${payment.invoiceNumber}.pdf`);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to generate invoice.' });
    }
  };

  const handleDeletePayment = async (id: string) => {
    setPayments(payments.filter(p => p.id !== id));
    toast({ title: 'Deleted', description: 'Payment record deleted' });
  };

  const totalRevenue = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const failedPayments = payments.filter(p => p.status === 'failed').length;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Payment Management</h1>

      {/* Manual Payment Entry */}
      <Card>
        <CardHeader>
          <CardTitle>Add Manual Payment</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div>
            <Label>Student Name</Label>
            <Input placeholder="Full Name" value={studentName} onChange={(e) => setStudentName(e.target.value)} />
          </div>
          <div>
            <Label>Paid Amount (₹)</Label>
            <Input type="number" placeholder="Amount" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button onClick={handleManualPayment} className="w-full">Add Payment</Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card><CardContent className="p-6 flex items-center gap-4"><DollarSign className="text-green-600" /><div><p>Total Revenue</p><p className="text-xl font-bold">₹{totalRevenue.toFixed(2)}</p></div></CardContent></Card>
        <Card><CardContent className="p-6 flex items-center gap-4"><CreditCard className="text-blue-600" /><div><p>Total Payments</p><p className="text-xl font-bold">{payments.length}</p></div></CardContent></Card>
        <Card><CardContent className="p-6 flex items-center gap-4"><Calendar className="text-yellow-600" /><div><p>Pending</p><p className="text-xl font-bold">{pendingPayments}</p></div></CardContent></Card>
        <Card><CardContent className="p-6 flex items-center gap-4"><FileText className="text-red-600" /><div><p>Failed</p><p className="text-xl font-bold">{failedPayments}</p></div></CardContent></Card>
      </div>

      {/* Search */}
      <Input
        placeholder="Search by student name..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-4"
      />

      <div className="flex gap-4 mb-4 items-center">
  <Label>Status Filter</Label>
  <select
    className="border border-gray-300 rounded px-3 py-1"
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value as 'all' | 'completed' | 'pending' | 'failed')}
  >
    <option value="all">All</option>
    <option value="completed">Completed</option>
    <option value="pending">Pending</option>
    <option value="failed">Failed</option>
  </select>
</div>


      {/* Payments Table */}
      <Card className="bg-white/90 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">All Payments</CardTitle>
          <CardDescription>View, download or delete payment records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments
                  .filter(p => p.profiles?.full_name.toLowerCase().includes(search.toLowerCase()))
                  .filter(p => statusFilter === 'all' || p.status === statusFilter)
                  .map(payment => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.invoiceNumber}</TableCell>
                      <TableCell>{payment.profiles?.full_name ?? 'Unknown Student'}</TableCell>
                      <TableCell>{payment.courses?.title ?? 'Unknown Course'}</TableCell>
                      <TableCell>₹{payment.amount}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => downloadInvoice(payment)} className="hover:bg-blue-50">
                            <Download className="h-4 w-4 mr-1" /> Invoice
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeletePayment(payment.id)} className="text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPayments;
