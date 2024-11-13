"use client";

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/context/AuthContext";
import { RegisterProvider } from '@/context/RegisterContext';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function GlobalProvider({ children }) {
  return (
    <>
    <SessionProvider>
    <ToastContainer position="bottom-right" />
        <AuthProvider>
            <RegisterProvider>
            {children}
            </RegisterProvider>
        </AuthProvider>
    </SessionProvider>
    </>
  );
}