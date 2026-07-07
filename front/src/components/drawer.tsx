"use client";

import * as React from "react";
import Image from "next/image";
import Logo from "../../public/Longa-logo.svg";
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
  ListItemIcon,
  ListItemText,
  Toolbar,
  useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import DashboardHeader from "./dashboard-header";
import Footer from "./footer";

import type { SidebarItem, HeaderItem } from "./layout/types";
import { getAdminHeaderConfig } from "./layout/headerConfig";
import { useUser } from "@/new-services/auth/AuthContext";

type Props = {
  title?: string;
  avatarSrc?: string;
  items?: SidebarItem[];
  settings?: HeaderItem[];
  children: React.ReactNode;
  drawerWidth?: number;
};

export default function DrawerLayout({
  title = "",
  avatarSrc,
  items = [],
  settings = [],
  children,
  drawerWidth = 260,
}: Props) {
  const pathname = usePathname();
  const theme = useTheme();
  const { effectiveRole } = useUser();

  const adminHeader = effectiveRole === "Admin" ? getAdminHeaderConfig(pathname) : null;
  const headerTitle = adminHeader?.title ?? title;
  const searchType = adminHeader?.searchType ?? null;

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = React.useState(false);

  const isActive = (href?: string, exact?: boolean) => {
    if (!href) return false;
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const drawerContent = (
    <>
      <Toolbar>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <Image
            src={Logo}
            alt="logo"
            style={{ width: "180px", marginTop: "-10px", alignSelf: "center" }}
            priority
          />
        </Box>
      </Toolbar>

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
                  if (!isLink) item.onClick?.();
                  if (isMobile) setOpen(false);
                }}
                selected={isLink ? isActive(item.href, "exact" in item ? item.exact : false) : false}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  ml: 1,
                  height: "40px",
                  color: "#1976d2",
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: "#1976d2" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{
                    primary: {
                      sx: { fontSize: "14px" },
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <DashboardHeader
        title={headerTitle}
        avatarSrc={avatarSrc}
        settings={settings}
        onMenuClick={() => setOpen(true)}
        drawerWidth={drawerWidth}
        isMobile={isMobile}
        searchType={searchType}
      />

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? open : true}
        onClose={() => setOpen(false)}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor: "var(--background-drawer)",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          ml: isMobile ? 0 : `${drawerWidth}px`,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh"
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }} />
        <Box sx={{ px: 4, pt: 2, pb: 4, flexGrow: 1 }}>{children}</Box>
        <Footer />
      </Box>
    </Box>
  );
}