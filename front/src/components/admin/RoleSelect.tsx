"use client";

import { useState } from "react";
import { Box, CircularProgress, Menu, MenuItem } from "@mui/material";
import { KeyboardArrowDown } from "@mui/icons-material";
import { Badge } from "@/components/ui/Badge";
import type { UserRoleDTO } from "@/services/api/users";

const ROLE_OPTIONS: {
  value: UserRoleDTO;
  label: string;
  color: "primary" | "secondary" | "neutral";
}[] = [
  { value: "Admin", label: "Administrador", color: "primary" },
  { value: "Professor", label: "Professor", color: "secondary" },
  { value: "Aluno", label: "Aluno", color: "neutral" },
];

function getRoleOption(role?: UserRoleDTO) {
  return ROLE_OPTIONS.find((option) => option.value === role) ?? ROLE_OPTIONS[2];
}

type RoleSelectProps = {
  value: UserRoleDTO;
  disabled?: boolean;
  loading?: boolean;
  onChange: (role: UserRoleDTO) => void;
};

export function RoleSelect({
  value,
  disabled,
  loading,
  onChange,
}: RoleSelectProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const current = getRoleOption(value);

  return (
    <>
      <Box
        component="button"
        type="button"
        disabled={disabled || loading}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          border: "1px solid #e5e7eb",
          borderRadius: "10px",
          px: 1,
          py: 0.5,
          bgcolor: "#fff",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.55 : 1,
          transition: "all 0.15s ease",
          "&:hover": disabled
            ? {}
            : {
                bgcolor: "#f9fafb",
                borderColor: "#d1d5db",
              },
        }}
      >
        <Badge color={current.color} label={current.label} />
        {!disabled && (
          <KeyboardArrowDown sx={{ fontSize: 18, color: "#9ca3af" }} />
        )}
        {loading && <CircularProgress size={14} thickness={5} />}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              mt: 0.5,
              minWidth: 200,
              border: "1px solid #f3f4f6",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            },
          },
        }}
      >
        {ROLE_OPTIONS.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === value}
            onClick={() => {
              setAnchorEl(null);
              if (option.value !== value) onChange(option.value);
            }}
            sx={{
              py: 1.25,
              "&.Mui-selected": { bgcolor: "#f8fafc" },
              "&.Mui-selected:hover": { bgcolor: "#f1f5f9" },
            }}
          >
            <Badge color={option.color} label={option.label} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export { ROLE_OPTIONS, getRoleOption };
