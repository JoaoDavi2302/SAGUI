// configuração geral
import type { Metadata } from "next";
import "./globals.css";
import ThemeRegistry from "@/theme-provider";

export const metadata: Metadata = {
  title: "Sagui",
  description: "Sistema Aberto de Gestão Universitaria Institucional",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" data-theme="light">
      <body className="min-h-screen flex flex-col">
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
