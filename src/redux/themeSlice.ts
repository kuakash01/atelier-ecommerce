import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ThemeState {
  currentTheme: "light" | "dark" | string;
  isSidebarOpen: boolean;
  isMobileOpen: boolean;
  isSideBarHovered: boolean;
  isAdminSidebarOpen: boolean;
  isLoading: boolean;
}

const initialState: ThemeState = {
  currentTheme: typeof window !== "undefined" ? localStorage.getItem("theme") || "light" : "light",
  isSidebarOpen: false,
  isMobileOpen: false,
  isSideBarHovered: false,
  isAdminSidebarOpen: true,
  isLoading: false,
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<"light" | "dark" | string>) => {
      state.currentTheme = action.payload;
    },
    toggleTheme: (state) => {
      state.currentTheme = state.currentTheme === "light" ? "dark" : "light";
    },
    setSidebar: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setMobileOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileOpen = action.payload;
    },
    toggleMobileOpen: (state) => {
      state.isMobileOpen = !state.isMobileOpen;
    },
    setSideBarHovered: (state, action: PayloadAction<boolean>) => {
      state.isSideBarHovered = action.payload;
    },
    setAdminSidebar: (state, action: PayloadAction<boolean>) => {
      state.isAdminSidebarOpen = action.payload;
    },
    toggleAdminSidebar: (state) => {
      state.isAdminSidebarOpen = !state.isAdminSidebarOpen;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  setSidebar,
  toggleSidebar,
  setMobileOpen,
  toggleMobileOpen,
  setSideBarHovered,
  setAdminSidebar,
  toggleAdminSidebar,
  setLoading,
} = themeSlice.actions;

export default themeSlice.reducer;
