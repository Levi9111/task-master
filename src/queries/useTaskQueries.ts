import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksService, type FilterTaskParams } from '../services/tasks.service';
import type { CreateTaskPayload } from '../types/task.types';
import { useAppDispatch } from '../app/store';
import { addToast } from '../app/slices/notificationSlice';

export function useTasksQuery(params?: FilterTaskParams) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => tasksService.getTasks(params),
  });
}

export function useTaskByIdQuery(taskId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: () => tasksService.getTaskById(taskId),
    enabled: !!taskId && enabled,
  });
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => tasksService.createTask(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      dispatch(addToast({ message: 'Task created successfully!', type: 'success' }));
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create task';
      dispatch(addToast({ message: Array.isArray(message) ? message[0] : message, type: 'error' }));
    },
  });
}

export function useUpdateTaskMutation() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: ({ taskId, payload }: { taskId: string; payload: Partial<CreateTaskPayload> }) =>
      tasksService.updateTask(taskId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', data.data._id] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      dispatch(addToast({ message: 'Task updated successfully!', type: 'success' }));
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update task';
      dispatch(addToast({ message: Array.isArray(message) ? message[0] : message, type: 'error' }));
    },
  });
}

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (taskId: string) => tasksService.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      dispatch(addToast({ message: 'Task deleted successfully!', type: 'success' }));
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete task';
      dispatch(addToast({ message: Array.isArray(message) ? message[0] : message, type: 'error' }));
    },
  });
}

export function useUploadAttachmentMutation() {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: ({ taskId, file }: { taskId: string; file: File }) =>
      tasksService.uploadAttachment(taskId, file),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', data.data._id] });
      dispatch(addToast({ message: 'File uploaded successfully!', type: 'success' }));
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to upload attachment';
      dispatch(addToast({ message: Array.isArray(message) ? message[0] : message, type: 'error' }));
    },
  });
}
