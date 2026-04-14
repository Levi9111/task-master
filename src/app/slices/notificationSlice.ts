import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface NotificationState {
  toasts: Toast[];
}

const initialState: NotificationState = {
  toasts: [],
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
      const id = crypto.randomUUID();
      state.toasts.push({ ...action.payload, id });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
  },
});

export const { addToast, removeToast } = notificationSlice.actions;
export default notificationSlice.reducer;
