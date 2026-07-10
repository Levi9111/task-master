import type { User } from './user.types';

export interface Comment {
  _id: string;
  content: string;
  taskId: string;
  authorId: User; // Populated User
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentPayload {
  content: string;
}
