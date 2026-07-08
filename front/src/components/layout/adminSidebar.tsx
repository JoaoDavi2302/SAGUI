"use client";

import {
  DashboardOutlined,
  HowToRegOutlined,
  MenuBookOutlined,
  PeopleOutlined,
  SchoolOutlined,
} from "@mui/icons-material";
import type { SidebarItem } from "./types";

export const adminSidebarItems: SidebarItem[] = [
  {
    icon: <DashboardOutlined />,
    label: "Painel",
    href: "/dashboard",
    exact: true,
  },
  {
    icon: <SchoolOutlined />,
    label: "Cursos",
    href: "/dashboard/cursos",
  },
  {
    icon: <MenuBookOutlined />,
    label: "Disciplinas",
    href: "/dashboard/disciplinas",
  },
  {
    icon: <PeopleOutlined />,
    label: "Usuários",
    href: "/dashboard/usuarios",
  },
  {
    icon: <HowToRegOutlined />,
    label: "Matrículas",
    href: "/dashboard/matriculas",
  },
];
