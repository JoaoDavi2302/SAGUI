"use client";

import {
  AssignmentOutlined,
  HomeOutlined,
  HowToRegOutlined,
  MenuBookOutlined,
  PeopleOutlined,
} from "@mui/icons-material";
import type { SidebarItem } from "./types";

export const adminSidebarItems: SidebarItem[] = [
  {
    icon: <HomeOutlined />,
    label: "Painel",
    href: "/dashboard",
    exact: true,
  },
  {
    icon: <MenuBookOutlined />,
    label: "Disciplinas",
    href: "/disciplinas",
  },
  {
    icon: <HowToRegOutlined />,
    label: "Matrículas",
    href: "/dashboard/matriculas",
  },
  {
    icon: <AssignmentOutlined />,
    label: "Avaliações",
    href: "/avaliacoes",
  },
  {
    icon: <PeopleOutlined />,
    label: "Usuários",
    href: "/dashboard/usuarios",
  },
];
