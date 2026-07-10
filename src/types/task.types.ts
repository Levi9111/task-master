import type { User } from './user.types';

export type TaskStatus = 'Todo' | 'InProgress' | 'Done' | 'Cancelled';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Attachment {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  path: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assigneeId?: User | string; // populated or ID
  teamId: string;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
  teamId: string;
}
