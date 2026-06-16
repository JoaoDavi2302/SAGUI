"use client";

import * as React from "react";

import Link from "next/link";

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

import { usePathname } from "next/navigation";

import DashboardHeader from "./dashboard-header";

import Footer from "./footer";

type Item = {
  label: string;
  href: string;
};

type Props = {
  title: string;
  logo?: React.ReactNode;
  avatarSrc?: string;
  items: Item[];
  settings?: Item[];
  children: React.ReactNode;
  drawerWidth?: number;
};

export default function DrawerLayout({
  title,
  logo,
  avatarSrc,
  items,
  settings = [],
  children,
  drawerWidth = 260,
}: Props) {
  const pathname = usePathname();

  const [open, setOpen] = React.useState(false);

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CssBaseline />

      <DashboardHeader
        title={title}
        avatarSrc={avatarSrc}
        settings={settings}
        onMenuClick={() => setOpen(true)}
      />

      <Toolbar />

      <Box
        sx={{
          flex: 1,
          display: "flex",
        }}
      >
        {/* menu lateral */}
        <Drawer
          variant="temporary"
          open={open}
          onClose={() => setOpen(false)}
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
            },
          }}
        >
          <Toolbar />

          <Divider />

          <List>
            {items.map((item) => (
              <ListItem key={item.href} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  selected={pathname === item.href}
                  onClick={() => setOpen(false)}
                >
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>

        {/* body */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              flex: 1,
              p: 3,
            }}
          >
            {children}
          </Box>

          <Footer />
        </Box>
      </Box>
    </Box>
  );
}
