"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Box,
  CssBaseline,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
} from "@mui/material";

import DashboardHeader from "./dashboard-header";
import Footer from "./footer";

import type { SidebarItem, HeaderItem } from "./layout/types";
import { useUser } from "@/services/AuthContext";

type Props = {
  title: string;
  avatarSrc?: string;
  items: SidebarItem[];
  settings?: HeaderItem[];
  children: React.ReactNode;
  drawerWidth?: number;
};

export default function DrawerLayout({
  title,
  avatarSrc,
  items,
  settings = [],
  children,
  drawerWidth = 260,
}: Props) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  const { logout } = useUser();

  const isActive = (href?: string) =>
    !!href && (pathname === href || pathname.startsWith(href + "/"));

  // 🔥 aqui está a correção real
  const enrichedSettings = settings.map((item) => {
    if ("onClick" in item && item.label === "Sair") {
      return {
        ...item,
        onClick: logout,
      };
    }
    return item;
  });

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <CssBaseline />

      <DashboardHeader
        title={title}
        avatarSrc={avatarSrc}
        settings={enrichedSettings}   // ✅ CORRIGIDO AQUI
        onMenuClick={() => setOpen(true)}
      />

      <Toolbar />

      <Box sx={{ flex: 1, display: "flex" }}>
        <Drawer
          variant="temporary"
          open={open}
          onClose={() => setOpen(false)}
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          <Toolbar />
          <Divider />

          <List sx={{ px: 1 }}>
            {items.map((item) => {
              const isLink = "href" in item;

              return (
                <ListItem key={item.label} disablePadding>
                  <ListItemButton
                    component={isLink ? Link : "button"}
                    href={isLink ? item.href : undefined}
                    onClick={() => {
                      if (!isLink) item.onClick();
                      setOpen(false);
                    }}
                    selected={isLink ? isActive(item.href) : false}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                    }}
                  >
                    <ListItemText primary={item.label} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Drawer>

        <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Box sx={{ flex: 1, p: 3 }}>{children}</Box>
          <Footer />
        </Box>
      </Box>
    </Box>
  );
}