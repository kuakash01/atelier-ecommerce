import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, UserData } from '../types';

const initialState: AuthState = {
  isAuthenticated: null,
  isAuthModalOpen: false,
  userData: null,
  isLoading: true,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setIsAuthenticated: (state, action: PayloadAction<boolean | null>) => {
      state.isAuthenticated = action.payload;
    },
    setIsAuthModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAuthModalOpen = action.payload;
    },
    setUserData: (state, action: PayloadAction<UserData | null>) => {
      state.userData = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setIsAuthenticated, setIsAuthModalOpen, setUserData, setIsLoading } = userSlice.actions;
export default userSlice.reducer;
