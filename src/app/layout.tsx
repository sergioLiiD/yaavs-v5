import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { QueryProvider } from "@/providers/query-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "YAAS - Sistema de Gestión",
  description: "Sistema de gestión para talleres de reparación",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <QueryProvider>
      <AuthProvider>
        <div className={inter.className}>
          {children}
        </div>
      </AuthProvider>
    </QueryProvider>
  );
}
