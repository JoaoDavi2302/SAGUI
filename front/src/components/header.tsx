"use client";

import * as React from "react";
import Link from "next/link";

import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";

type NavItem = {
  label: string;
  href: string;
};

type HeaderProps = {
  title: string;
  logo?: React.ReactNode;
  avatarSrc?: string;
  pages: NavItem[];
  settings?: NavItem[];
};

export default function Header({
  title,
  logo,
  avatarSrc,
  pages,
  settings = [],
}: HeaderProps) {
  const [anchorNav, setAnchorNav] = React.useState<HTMLElement | null>(null);

  const [anchorUser, setAnchorUser] = React.useState<HTMLElement | null>(null);

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar>
          {logo}

          <Typography sx={{ ml: 2 }}>{title}</Typography>

          <Box sx={{ flexGrow: 1 }} />

          {/* MENU */}
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <Button
                key={page.href}
                component={Link}
                href={page.href}
                color="inherit"
              >
                {page.label}
              </Button>
            ))}
          </Box>

          {/* MOBILE */}
          <IconButton
            color="inherit"
            onClick={(e) => setAnchorNav(e.currentTarget)}
            sx={{ display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Menu
            anchorEl={anchorNav}
            open={Boolean(anchorNav)}
            onClose={() => setAnchorNav(null)}
          >
            {pages.map((page) => (
              <MenuItem key={page.href} component={Link} href={page.href}>
                {page.label}
              </MenuItem>
            ))}
          </Menu>

          {/* USER */}
          <Tooltip title="Conta">
            <IconButton onClick={(e) => setAnchorUser(e.currentTarget)}>
              <Avatar src={avatarSrc} />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorUser}
            open={Boolean(anchorUser)}
            onClose={() => setAnchorUser(null)}
          >
            {settings.map((item) => (
              <MenuItem key={item.href} component={Link} href={item.href}>
                {item.label}
              </MenuItem>
            ))}
          </Menu>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
