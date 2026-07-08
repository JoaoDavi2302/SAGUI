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
  Badge,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useRouter } from "next/navigation";

import type { HeaderItem, HeaderSearchType } from "./layout/types";
import { useUser } from "@/new-services/auth/AuthContext";
import AdminCourseSearch from "./admin/AdminCourseSearch";
import AdminDisciplineSearch from "./admin/AdminDisciplineSearch";
import AdminActivitySearch from "./admin/AdminActivitySearch";
import { AdminUserSearch } from "./admin/AdminUserSearch";
import ProfessorDisciplineSearch from "./professor/ProfessorDisciplineSearch";

type Props = {
  title?: string;
  avatarSrc?: string;
  settings?: HeaderItem[];
  onMenuClick?: () => void;
  drawerWidth?: number;
  isMobile?: boolean;
  searchType?: HeaderSearchType | null;
};

function HeaderSearch({ searchType }: { searchType: HeaderSearchType }) {
  switch (searchType) {
    case "courses":
      return <AdminCourseSearch />;
    case "disciplines":
      return <AdminDisciplineSearch />;
    case "activities":
      return <AdminActivitySearch />;
    case "users":
      return <AdminUserSearch variant="header" />;
    case "professor-disciplines":
      return <ProfessorDisciplineSearch />;
    default:
      return null;
  }
}

export default function DashboardHeader({
  title = "",
  avatarSrc,
  settings = [],
  onMenuClick,
  drawerWidth = 260,
  isMobile = false,
  searchType = null,
}: Props) {
  const router = useRouter();
  const { logout, user } = useUser();

  const [anchorUser, setAnchorUser] =
    React.useState<HTMLElement | null>(null);

  const hasSearch = Boolean(searchType);

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
      <Toolbar
        sx={{
          display: "grid",
          alignItems: "center",
          gap: { xs: 1.5, sm: 2 },
          minHeight: { xs: 56, sm: 64 },
          px: { xs: 1.5, sm: 2 },
          gridTemplateColumns: hasSearch
            ? {
                xs: "auto 1fr",
                sm: "minmax(0, 1fr) minmax(320px, 480px) minmax(0, 1fr)",
              }
            : "1fr auto",
          gridTemplateRows: hasSearch
            ? { xs: "auto auto", sm: "auto" }
            : "auto",
          gridTemplateAreas: hasSearch
            ? {
                xs: `"menu actions" "search search"`,
                sm: `"left search actions"`,
              }
            : `"left actions"`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            minWidth: 0,
            gridArea: "left",
            justifySelf: "start",
          }}
        >
          {isMobile && onMenuClick && (
            <IconButton color="inherit" onClick={onMenuClick} edge="start">
              <MenuIcon />
            </IconButton>
          )}
          {title ? (
            <Typography variant="h6" sx={{ ml: isMobile ? 1 : 2, color: "#fff" }}>
              {title}
            </Typography>
          ) : null}
        </Box>

        {hasSearch && searchType ? (
          <Box
            sx={{
              gridArea: "search",
              width: "100%",
              justifySelf: "center",
              maxWidth: { xs: "100%", sm: 480 },
            }}
          >
            <React.Suspense fallback={null}>
              <HeaderSearch searchType={searchType} />
            </React.Suspense>
          </Box>
        ) : null}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            gridArea: "actions",
            justifySelf: "end",
          }}
        >
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
