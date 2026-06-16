// configuração de rotas de dashboard
// irão ser protegidas
// irá ter um novo header e menu lateral
import DrawerLayout from "@/components/drawer";

import type { Metadata } from "next";

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
    <DrawerLayout
      title="Sagui Admin"
      avatarSrc="/avatar.png"
      // links do menu lateral
      items={[
        {
          label: "Dashboard",
          href: "/dashboard",
        },
      ]}
      // menu perfil
      settings={[
        {
          label: "Site",
          href: "/",
        },
        {
          label: "Perfil",
          href: "/perfil",
        },
        {
          label: "Sair",
          href: "/logout",
        },
      ]}
    >
      {children}
    </DrawerLayout>
  );
}
