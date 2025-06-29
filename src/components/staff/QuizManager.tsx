
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const QuizManager: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Quiz Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Quiz management functionality will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};
