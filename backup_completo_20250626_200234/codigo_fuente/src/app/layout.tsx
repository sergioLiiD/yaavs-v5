import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import 'leaflet/dist/leaflet.css';

const montserrat = Montserrat({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-montserrat',
});

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
    <html lang="es">
      <body className={montserrat.className}>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
