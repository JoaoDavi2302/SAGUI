"use client";

import * as React from "react";
import Link from "next/link";

import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";

type Item = {
  label: string;
  href: string;
};

type Props = {
  title: string;

  avatarSrc?: string;

  settings?: Item[];

  onMenuClick: () => void;
};

export default function DashboardHeader({
  title,
  avatarSrc,
  settings = [],
  onMenuClick,
}: Props) {
  const [anchorUser, setAnchorUser] = React.useState<HTMLElement | null>(null);

  return (
    <AppBar position="fixed">
      <Toolbar>
        <IconButton color="inherit" onClick={onMenuClick} edge="start">
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          sx={{
            ml: 2,
            flexGrow: 1,
          }}
        >
          {title}
        </Typography>

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
    </AppBar>
  );
}
