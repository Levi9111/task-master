import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type ModalType = 'createTask' | 'inviteMember' | 'editTeam' | null;

interface UIState {
  sidebarCollapsed: boolean;
  activeTeamId: string | null;
  activeModal: ModalType;
}

const initialState: UIState = {
  sidebarCollapsed: false,
  activeTeamId: null,
  activeModal: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },

    setActiveTeam: (state, action: PayloadAction<string | null>) => {
      state.activeTeamId = action.payload;
    },

    openModal: (state, action: PayloadAction<ModalType>) => {
      state.activeModal = action.payload;
    },

    closeModal: (state) => {
      state.activeModal = null;
    },
  },
});

export const { toggleSidebar, setActiveTeam, openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;
