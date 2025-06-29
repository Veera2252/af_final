
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const ContentManager: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Content Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Content management functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};
