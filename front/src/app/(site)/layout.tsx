// rota padrão
import Header from "@/components/header";
import Footer from "@/components/footer";
import HomeIcon from "@mui/icons-material/Home";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header
        // logo={<HomeIcon />}
        title="Sagui"
        avatarSrc="/avatar.png"
        pages={[
          {
            label: "Sobre",
            href: "/sobre",
          },
        ]}
        settings={[
          {
            label: "Dashboard",
            href: "/dashboard",
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
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
