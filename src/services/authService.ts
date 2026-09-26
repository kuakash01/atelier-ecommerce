import apiAdmin from "../config/apiAdmin";
import apiUser from "../config/apiUser";
import { UserData } from "../types";

export interface CheckAuthResponse {
  isAuthenticated: boolean;
  userData: UserData | null;
}

export const checkAuthAdmin = async (): Promise<any | null> => {
  try {
    const res = await apiAdmin.get("/admin/auth/me", {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });
    return res.data?.user || null;
  } catch (err) {
    return null;
  }
};

export const checkAuthUser = async (): Promise<CheckAuthResponse | null> => {
  try {
    const res = await apiUser.get("/auth/me", {
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });
    if (res.data?.status === "success" && res.data?.data) {
      return {
        isAuthenticated: true,
        userData: res.data.data.userData,
      };
    }
    return {
      isAuthenticated: false,
      userData: null,
    };
  } catch (err: any) {
    return {
      isAuthenticated: false,
      userData: null,
    };
  }
};

export const signoutAdmin = async () => {
  try {
    const res = await apiAdmin.get("/admin/auth/signout");
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin_token");
      localStorage.removeItem("adminInfo");
    }
    return res.data;
  } catch (err) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin_token");
      localStorage.removeItem("adminInfo");
    }
    return null;
  }
};

export const signoutUser = async () => {
  try {
    const res = await apiUser.get("/auth/signout");
    if (typeof window !== "undefined") {
      localStorage.removeItem("user_token");
      localStorage.removeItem("token");
    }
    return res.data;
  } catch (err) {
    console.error("Error signing out user:", err);
    if (typeof window !== "undefined") {
      localStorage.removeItem("user_token");
      localStorage.removeItem("token");
    }
    return null;
  }
};
