"use client";

import {
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
  type SelectChangeEvent,
} from "@mui/material";
import { KeyboardArrowDown } from "@mui/icons-material";
import type { UserRoleDTO } from "@/new-services/poo/shared/api/users";

const ROLE_OPTIONS: {
  value: UserRoleDTO;
  label: string;
}[] = [
  { value: "Admin", label: "Administrador" },
  { value: "Professor", label: "Professor" },
  { value: "Aluno", label: "Aluno" },
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
  function handleChange(event: SelectChangeEvent<UserRoleDTO>) {
    onChange(event.target.value as UserRoleDTO);
  }

  return (
    <FormControl size="small" sx={{ minWidth: 150 }}>
      <Select
        value={value}
        disabled={disabled || loading}
        onChange={handleChange}
        displayEmpty
        IconComponent={
          loading
            ? () => <CircularProgress size={14} thickness={5} sx={{ mr: 1 }} />
            : KeyboardArrowDown
        }
        sx={{
          fontSize: "0.875rem",
          bgcolor: "transparent",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#e5e7eb",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#d1d5db",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderWidth: 1,
          },
        }}
      >
        {ROLE_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export { ROLE_OPTIONS, getRoleOption };
