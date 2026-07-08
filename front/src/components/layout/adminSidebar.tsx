"use client";

import {
  AssignmentOutlined,
  AttachFileOutlined,
  DashboardOutlined,
  // HomeOutlined,
  HowToRegOutlined,
  MenuBookOutlined,
  PeopleOutlined,
  SchoolOutlined,
} from "@mui/icons-material";
import type { SidebarItem } from "./types";

export const adminSidebarItems: SidebarItem[] = [
  {
    icon: <SchoolOutlined />,
    label: "Cursos",
    href: "/cursos",
  },
  {
    icon: <MenuBookOutlined />,
    label: "Disciplinas",
    href: "/disciplinas",
  },
  {
    icon: <AssignmentOutlined />,
    label: "Avaliações",
    href: "/avaliacoes",
  },
  // {
  //   icon: <PeopleOutlined />,
  //   label: "Usuários",
  //   href: "/dashboard/usuarios",
  // },
  {
    icon: <AttachFileOutlined />,
    label: "Modulos",
    href: "/modulos",
  },
    {
    icon: <AttachFileOutlined />,
    label: "Materiais",
    href: "/materiais",
  },
  {
    icon: <DashboardOutlined />,
    label: "Dashboard",
    href: "/dashboard",
    exact: true,
  },
];
