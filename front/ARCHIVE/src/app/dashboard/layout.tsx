// configuração de rotas de dashboard
// irão ser protegidas
// irá ter um novo header e menu lateral
import Footer from "@/components/footer";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sagui | Dashboard",
  description: "Gestão Sagui",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </div>
  );
}
