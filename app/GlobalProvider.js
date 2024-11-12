"use client";

import { SessionProvider } from "next-auth/react";


export function GlobalProvider({ children }) {
  return (
    <>

        <SessionProvider>{children}</SessionProvider>

    </>
  );
}