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
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

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
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [open, setOpen] = React.useState(false);

  const { logout } = useUser();

  const isActive = (href?: string) =>
    !!href && (pathname === href || pathname.startsWith(href + "/"));

  const drawerContent = (
    <>
      <Toolbar>
        <Box sx={{ py: 2 }}>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              fontSize: "24px",
              fontFamily: "system-ui",
              color: "#1f2937",
            }}
          >
            SAGUI
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: "12px",
              fontWeight: "200",
              fontFamily: "system-ui",
              color: "#1f2937",
            }}
          >
            Plataforma academica
          </Typography>
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
                selected={isLink ? isActive(item.href) : false}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  ml: 1,
                  height: "40px",
                  color: "#4c34b9",
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: "#4c34b9" }}>
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
        title={title}
        avatarSrc={avatarSrc}
        settings={settings}
        onMenuClick={() => setOpen(true)}
        drawerWidth={drawerWidth}
        isMobile={isMobile}
      />

      {/* DRAWER RESPONSIVO */}
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
        }}
      >
        <Toolbar />
        <Box sx={{ p: 4 }}>
          {children}
        </Box>
        <Divider sx={{ mt: 3 }} />
        <Footer />
      </Box>
    </Box>
  );
}