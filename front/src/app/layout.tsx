import type { Metadata } from "next";
import "./globals.css";

import ThemeRegistry from "@/theme-provider";

import { AuthProvider } from "@/services/auth/AuthContext";
import { DataProvider } from "@/services/auth/dataContext";

export const metadata: Metadata = {
  title: "Sagui",
  description: "Sistema Aberto de Gestão Universitária Institucional",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ThemeRegistry>
          <AuthProvider>
            <DataProvider>{children}</DataProvider>
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
