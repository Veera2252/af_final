import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Download, Upload, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CourseMaterial {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  file_type: string;
  file_size: number | null;
  order_index: number | null;
  created_at: string;
  updated_at: string;
}

interface CourseMaterialsProps {
  courseId?: string;
  isInstructor?: boolean;
}

export const CourseMaterials = ({ courseId, isInstructor = false }: CourseMaterialsProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    file_type: 'document',
    file_url: '',
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchMaterials();
    }
  }, [courseId]);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('course_materials')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch course materials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaterial = async () => {
    if (!newMaterial.title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('course_materials')
        .insert({
          course_id: courseId,
          title: newMaterial.title,
          description: newMaterial.description,
          file_type: newMaterial.file_type,
          file_url: newMaterial.file_url || null,
          order_index: materials.length,
        });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Material added successfully",
      });
      
      setNewMaterial({ title: '', description: '', file_type: 'document', file_url: '' });
      setDialogOpen(false);
      fetchMaterials();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add material",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    try {
      const { error } = await supabase
        .from('course_materials')
        .delete()
        .eq('id', materialId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Material deleted successfully",
      });
      
      fetchMaterials();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete material",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType.toLowerCase()) {
      case 'pdf':
      case 'document':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'video':
        return <FileText className="h-8 w-8 text-blue-500" />;
      case 'image':
        return <FileText className="h-8 w-8 text-green-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  if (loading) {
    return <div className="p-6">Loading course materials...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Course Materials</h3>
        {isInstructor && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Material
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Material</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={newMaterial.title}
                    onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                    placeholder="Enter material title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newMaterial.description}
                    onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                    placeholder="Enter material description"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">File Type</label>
                  <select
                    value={newMaterial.file_type}
                    onChange={(e) => setNewMaterial({ ...newMaterial, file_type: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="document">Document</option>
                    <option value="video">Video</option>
                    <option value="image">Image</option>
                    <option value="pdf">PDF</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">File URL (optional)</label>
                  <Input
                    value={newMaterial.file_url}
                    onChange={(e) => setNewMaterial({ ...newMaterial, file_url: e.target.value })}
                    placeholder="Enter file URL"
                  />
                </div>
                <Button onClick={handleAddMaterial} className="w-full">
                  Add Material
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4">
        {materials.map((material) => (
          <Card key={material.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getFileIcon(material.file_type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{material.title}</h4>
                    {material.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {material.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="secondary">{material.file_type}</Badge>
                      {material.file_size && (
                        <Badge variant="outline">{formatFileSize(material.file_size)}</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {material.file_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(material.file_url!, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  {isInstructor && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteMaterial(material.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {materials.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No materials available for this course</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};