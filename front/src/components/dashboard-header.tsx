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
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import { useRouter } from "next/navigation";
import SearchIcon from "@mui/icons-material/Search";

import type { HeaderItem } from "./layout/types";
import { useUser } from "@/services/AuthContext";
import { Search, SearchIconWrapper, StyledInputBase } from "./components";

type Props = {
  title: string;
  avatarSrc?: string;
  settings?: HeaderItem[];
  onMenuClick?: () => void;
};

export default function DashboardHeader({
  title,
  avatarSrc,
  settings = [],
  onMenuClick,
}: Props) {
  const router = useRouter();
  const { logout, user } = useUser();
  const [anchorUser, setAnchorUser] = React.useState<HTMLElement | null>(null);

  return (
    <AppBar position="fixed">
      <Toolbar>
        {onMenuClick && (
          <IconButton color="inherit" onClick={onMenuClick} edge="start">
            <MenuIcon />
          </IconButton>
        )}

        <Typography variant="h6" sx={{ ml: 2, flexGrow: 1 }}>
          {title}
        </Typography>

        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search…"
            inputProps={{ "aria-label": "search" }}
          />
        </Search>

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
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{fontWeight:600}}>
              {user?.name ?? "Usuário"}
            </Typography>

            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {user?.role ?? "Sem perfil"}
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
                  <Typography sx={{fontFamily:"sans-serif"}}>
                    {item.label}
                  </Typography>
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
