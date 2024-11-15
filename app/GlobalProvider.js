"use client";

import { SessionProvider } from "next-auth/react";
import { LiffSessionProvider } from '@/context/LiffSessionContext';
import { AuthProvider } from "@/context/AuthContext";
import { GradeProvider } from '@/context/GradeContext';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function GlobalProvider({ children }) {
  return (
    <>

    <SessionProvider>
    <ToastContainer position="bottom-right" />
        <AuthProvider>
            <GradeProvider>
            {children}
            </GradeProvider>
        </AuthProvider>
    </SessionProvider>

    </>
  );
}