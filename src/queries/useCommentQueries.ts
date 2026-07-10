import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsService } from '../services/comments.service';
import type { CreateCommentPayload } from '../types/comment.types';
import { useAppDispatch } from '../app/store';
import { addToast } from '../app/slices/notificationSlice';

export function useCommentsQuery(taskId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => commentsService.getComments(taskId),
    enabled: !!taskId && enabled,
  });
}

export function useCreateCommentMutation() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: CreateCommentPayload }) =>
      commentsService.createComment(taskId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.taskId] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to post comment';
      dispatch(addToast({ message: Array.isArray(message) ? message[0] : message, type: 'error' }));
    },
  });
}
