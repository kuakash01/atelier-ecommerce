'use client';

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function useScrollToTop(smooth = false) {
    const { pathname } = useLocation();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            if (smooth) {
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                window.scrollTo(0, 0);
            }
        }
    }, [pathname, smooth]);
}
