import type { Metadata } from "next";
import "./globals.css";

import ThemeRegistry from "@/theme-provider";

import { AuthProvider } from "@/new-services/auth/AuthContext";

export const metadata: Metadata = {
  title: "Sagui",
  description: "Sistema Aberto de Gestão Universitária Institucional",
  icons: {
    icon: "/Curta-logo.svg",
  },
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
          <AuthProvider>{children}</AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
