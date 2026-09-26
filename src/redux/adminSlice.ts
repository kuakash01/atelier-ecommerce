import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AdminInfo {
  _id?: string;
  name?: string;
  email?: string;
  role?: string;
  token?: string;
  [key: string]: any;
}

export interface AdminState {
  isAuthenticated: boolean;
  adminInfo: AdminInfo | null;
}

const initialState: AdminState = {
  isAuthenticated: false,
  adminInfo: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<AdminInfo>) => {
      state.isAuthenticated = true;
      state.adminInfo = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.adminInfo = null;
    },
    updateAdmin: (state, action: PayloadAction<Partial<AdminInfo>>) => {
      if (state.adminInfo) {
        state.adminInfo = { ...state.adminInfo, ...action.payload };
      }
    },
  },
});

export const { login, logout, updateAdmin } = adminSlice.actions;
export default adminSlice.reducer;
