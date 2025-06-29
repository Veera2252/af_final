
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const CourseViewer: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Course Viewer</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Course viewing functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};
