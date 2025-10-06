import React from 'react';
import { AssignmentManager as BaseAssignmentManager } from '@/components/assessments/AssignmentManager';

interface AssignmentManagerProps {
  courseId?: string;
}

export const AssignmentManager: React.FC<AssignmentManagerProps> = ({ courseId }) => {
  return <BaseAssignmentManager courseId={courseId} />;
};
