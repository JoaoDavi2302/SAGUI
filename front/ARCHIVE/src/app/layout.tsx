// configuração geral
import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}