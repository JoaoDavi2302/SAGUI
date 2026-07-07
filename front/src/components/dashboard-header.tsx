"use client";

import * as React from "react";
import Link from "next/link";

import {
  AppBar,
  Avatar,
  Box,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  Badge, // Adicionado
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications"; // Adicionado
import { useRouter } from "next/navigation";
import SearchIcon from "@mui/icons-material/Search";
import { useTheme } from "@mui/material/styles";

import type { HeaderItem } from "./layout/types";
import { useUser } from "@/services/auth/AuthContext";
import { Search, SearchIconWrapper, StyledInputBase } from "./components";

type Props = {
  title: string;
  avatarSrc?: string;
  settings?: HeaderItem[];
  onMenuClick?: () => void;
  drawerWidth?: number;
  isMobile?: boolean;
};

export default function DashboardHeader({
  title,
  avatarSrc,
  settings = [],
  onMenuClick,
  drawerWidth = 260,
  isMobile = false,
}: Props) {
  const router = useRouter();
  const { logout, user } = useUser();

  const [anchorUser, setAnchorUser] =
    React.useState<HTMLElement | null>(null);

  const theme = useTheme();

  return (
    <AppBar
      position="fixed"
      sx={(theme) => ({
        width: isMobile ? "100%" : `calc(100% - ${drawerWidth}px)`,
        ml: isMobile ? 0 : `${drawerWidth}px`,
        transition: theme.transitions.create(["width", "margin"], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.standard,
        }),
      })}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {isMobile && onMenuClick && (
            <IconButton color="inherit" onClick={onMenuClick} edge="start">
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ ml: 2, color: "#fff" }}>
            {title}
          </Typography>
        </Box>

        <Search sx={{ width: '40%' }}>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Pesquisar cursos..."
            inputProps={{ "aria-label": "search" }}
          />
        </Search>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton color="inherit">
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Tooltip title="Conta">
            <IconButton onClick={(e) => setAnchorUser(e.currentTarget)}>
              <Avatar src={avatarSrc} />
            </IconButton>
          </Tooltip>
        </Box>

        <Menu
          anchorEl={anchorUser}
          open={Boolean(anchorUser)}
          onClose={() => setAnchorUser(null)}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {user?.nome ?? "Usuário"}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {user?.perfil ?? "Sem perfil"}
            </Typography>
          </Box>
          <Divider />
          {settings.map((item) => {
            if ("action" in item && item.action === "logout") {
              return (
                <MenuItem
                  key={item.label}
                  onClick={() => {
                    setAnchorUser(null);
                    logout();
                    router.push("/login");
                  }}
                >
                  {item.label}
                </MenuItem>
              );
            }
            if ("href" in item) {
              return (
                <MenuItem
                  key={item.label}
                  component={Link}
                  href={item.href}
                  onClick={() => setAnchorUser(null)}
                >
                  {item.label}
                </MenuItem>
              );
            }
            return null;
          })}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}