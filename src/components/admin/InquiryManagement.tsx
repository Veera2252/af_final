
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  MessageCircle, 
  Phone, 
  Mail, 
  Calendar, 
  User, 
  BookOpen,
  Filter,
  Search,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  UserCheck,
  X
} from 'lucide-react';
import { format } from 'date-fns';

interface CourseInquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  course_interest: string | null;
  message: string;
  status: 'new' | 'contacted' | 'converted' | 'closed';
  created_at: string;
  updated_at: string;
}

export const InquiryManagement: React.FC = () => {
  const [inquiries, setInquiries] = useState<CourseInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<CourseInquiry | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const { data, error } = await supabase
        .from('course_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInquiries(data || []);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      toast({
        title: "Error",
        description: "Failed to fetch inquiries.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateInquiryStatus = async (id: string, status: CourseInquiry['status']) => {
    try {
      const { error } = await supabase
        .from('course_inquiries')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      setInquiries(prev => 
        prev.map(inquiry => 
          inquiry.id === id 
            ? { ...inquiry, status, updated_at: new Date().toISOString() }
            : inquiry
        )
      );

      toast({
        title: "Status Updated",
        description: `Inquiry status updated to ${status}.`,
      });
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      toast({
        title: "Error",
        description: "Failed to update inquiry status.",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <Clock className="h-4 w-4" />;
      case 'contacted':
        return <Phone className="h-4 w-4" />;
      case 'converted':
        return <CheckCircle className="h-4 w-4" />;
      case 'closed':
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'converted':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = 
      inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inquiry.course_interest && inquiry.course_interest.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: inquiries.length,
    new: inquiries.filter(i => i.status === 'new').length,
    contacted: inquiries.filter(i => i.status === 'contacted').length,
    converted: inquiries.filter(i => i.status === 'converted').length,
    closed: inquiries.filter(i => i.status === 'closed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Inquiries</h1>
          <p className="text-gray-600">Manage inquiries from the course chatbot</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card key={status}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className={`p-2 rounded-full ${getStatusColor(status)}`}>
                  {getStatusIcon(status)}
                </div>
                <div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm text-gray-600 capitalize">{status === 'all' ? 'Total' : status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, or course interest..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inquiries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inquiries ({filteredInquiries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInquiries.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No inquiries found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Course Interest</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInquiries.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell className="font-medium">{inquiry.name}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-sm">
                            <Mail className="h-3 w-3" />
                            <span>{inquiry.email}</span>
                          </div>
                          {inquiry.phone && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Phone className="h-3 w-3" />
                              <span>{inquiry.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {inquiry.course_interest ? (
                          <Badge variant="outline">{inquiry.course_interest}</Badge>
                        ) : (
                          <span className="text-gray-400">Not specified</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(inquiry.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(inquiry.status)}
                            <span className="capitalize">{inquiry.status}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {format(new Date(inquiry.created_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedInquiry(inquiry)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Inquiry Details</DialogTitle>
                              </DialogHeader>
                              {selectedInquiry && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Name</label>
                                      <p className="text-sm">{selectedInquiry.name}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Email</label>
                                      <p className="text-sm">{selectedInquiry.email}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Phone</label>
                                      <p className="text-sm">{selectedInquiry.phone || 'Not provided'}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Course Interest</label>
                                      <p className="text-sm">{selectedInquiry.course_interest || 'Not specified'}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium text-gray-700">Message</label>
                                    <p className="text-sm bg-gray-50 p-3 rounded-md mt-1">{selectedInquiry.message}</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Created</label>
                                      <p className="text-sm">{format(new Date(selectedInquiry.created_at), 'PPP p')}</p>
                                    </div>
                                    <div>
                                      <label className="text-sm font-medium text-gray-700">Status</label>
                                      <div className="mt-1">
                                        <Select
                                          value={selectedInquiry.status}
                                          onValueChange={(value: CourseInquiry['status']) => 
                                            updateInquiryStatus(selectedInquiry.id, value)
                                          }
                                        >
                                          <SelectTrigger className="w-full">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="new">New</SelectItem>
                                            <SelectItem value="contacted">Contacted</SelectItem>
                                            <SelectItem value="converted">Converted</SelectItem>
                                            <SelectItem value="closed">Closed</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Select
                            value={inquiry.status}
                            onValueChange={(value: CourseInquiry['status']) => 
                              updateInquiryStatus(inquiry.id, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="converted">Converted</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
