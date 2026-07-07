"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Avatar,
  Box,
  CircularProgress,
  InputBase,
  List,
  ListItemButton,
  Paper,
  Typography,
  alpha,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import type { UserProfileDTO } from "@/new-services/poo/shared/api/catalog";
import { listUsersPage } from "@/new-services/poo/shared/api/users";

const PREVIEW_LIMIT = 6;
const DEBOUNCE_MS = 300;

function getInitials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

type Props = {
  variant?: "header" | "page";
};

export function AdminUserSearch({ variant = "page" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isUserPage = pathname.startsWith("/dashboard/usuarios");
  const isHeader = variant === "header";

  const [query, setQuery] = React.useState("");
  const [preview, setPreview] = React.useState<UserProfileDTO[]>([]);
  const [loadingPreview, setLoadingPreview] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);

  React.useEffect(() => {
    setQuery(isUserPage ? (searchParams.get("user") ?? "") : "");
  }, [searchParams, isUserPage]);

  React.useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setPreview([]);
      setLoadingPreview(false);
      return;
    }

    setLoadingPreview(true);
    const timeout = window.setTimeout(() => {
      listUsersPage({ search: trimmed, page: 0, size: PREVIEW_LIMIT })
        .then((data) => setPreview(data.content))
        .catch(() => setPreview([]))
        .finally(() => setLoadingPreview(false));
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timeout);
  }, [query]);

  const hasQuery = query.trim().length > 0;
  const showDropdown = open && hasQuery;

  function closeDropdown() {
    setOpen(false);
    setActiveIndex(-1);
  }

  function applySearch(term: string) {
    const trimmed = term.trim();
    closeDropdown();
    router.push(
      trimmed
        ? `/dashboard/usuarios?user=${encodeURIComponent(trimmed)}`
        : "/dashboard/usuarios",
    );
  }

  function selectUser(user: UserProfileDTO) {
    applySearch(user.email);
  }

  React.useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        closeDropdown();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <Box
      ref={containerRef}
      component="form"
      onSubmit={(event) => {
        event.preventDefault();
        if (activeIndex >= 0 && preview[activeIndex]) {
          selectUser(preview[activeIndex]);
          return;
        }
        applySearch(query);
      }}
      sx={{
        position: "relative",
        width: "100%",
        maxWidth: isHeader ? "100%" : 480,
        mb: isHeader ? 0 : 3,
      }}
    >
      <Box
        sx={(theme) =>
          isHeader
            ? {
                display: "flex",
                alignItems: "center",
                width: "100%",
                height: 44,
                borderRadius: "12px",
                px: 1.5,
                bgcolor: alpha(theme.palette.common.white, 0.14),
                border: `1px solid ${alpha(theme.palette.common.white, 0.18)}`,
                transition: theme.transitions.create([
                  "background-color",
                  "border-color",
                  "box-shadow",
                ]),
                "&:hover": {
                  bgcolor: alpha(theme.palette.common.white, 0.2),
                },
                "&:focus-within": {
                  bgcolor: alpha(theme.palette.common.white, 0.22),
                  borderColor: alpha(theme.palette.common.white, 0.35),
                  boxShadow: `0 0 0 3px ${alpha(theme.palette.common.white, 0.12)}`,
                },
              }
            : {
                display: "flex",
                alignItems: "center",
                width: "100%",
                height: 44,
                borderRadius: "12px",
                px: 1.5,
                bgcolor: "#fff",
                border: `1px solid ${theme.palette.divider}`,
                transition: theme.transitions.create(["border-color", "box-shadow"]),
                "&:focus-within": {
                  borderColor: theme.palette.primary.main,
                  boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.12)}`,
                },
              }
        }
      >
        <SearchIcon
          sx={{
            fontSize: 20,
            mr: 1,
            opacity: isHeader ? 0.85 : 0.55,
            color: isHeader ? "inherit" : "text.secondary",
          }}
        />
        <InputBase
          placeholder="Pesquisar usuários..."
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => {
            if (hasQuery) setOpen(true);
          }}
          onKeyDown={(event) => {
            if (!showDropdown || preview.length === 0) return;

            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((current) =>
                current < preview.length - 1 ? current + 1 : 0,
              );
            }

            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((current) =>
                current > 0 ? current - 1 : preview.length - 1,
              );
            }

            if (event.key === "Escape") {
              closeDropdown();
            }
          }}
          inputProps={{
            "aria-label": "Pesquisar usuários",
            "aria-expanded": showDropdown,
          }}
          sx={{
            flex: 1,
            color: isHeader ? "inherit" : undefined,
            fontSize: "0.95rem",
            "& input": isHeader
              ? {
                  py: 0,
                  "&::placeholder": {
                    color: "inherit",
                    opacity: 0.72,
                  },
                }
              : undefined,
            "& input::placeholder": isHeader ? undefined : { opacity: 0.65 },
          }}
        />
        {loadingPreview && (
          <CircularProgress
            size={16}
            thickness={5}
            color={isHeader ? "inherit" : "primary"}
            sx={{ ml: 1, opacity: isHeader ? 0.8 : 1 }}
          />
        )}
      </Box>

      {showDropdown ? (
        <Paper
          elevation={isHeader ? 8 : 4}
          sx={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            overflow: "hidden",
            borderRadius: 2,
            zIndex: (theme) => theme.zIndex.modal,
          }}
        >
          {loadingPreview ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={22} />
            </Box>
          ) : preview.length === 0 ? (
            <Box sx={{ px: 2, py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Nenhum usuário encontrado.
              </Typography>
            </Box>
          ) : (
            <List dense disablePadding>
              {preview.map((user, index) => (
                <ListItemButton
                  key={user.id}
                  selected={index === activeIndex}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectUser(user)}
                  sx={{ alignItems: "center", gap: 1.5, py: 1.25 }}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: "#eef2ff",
                      color: "#4338ca",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                    }}
                  >
                    {getInitials(user.name)}
                  </Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                      {user.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {user.email}
                    </Typography>
                  </Box>
                </ListItemButton>
              ))}
            </List>
          )}
        </Paper>
      ) : null}
    </Box>
  );
}
