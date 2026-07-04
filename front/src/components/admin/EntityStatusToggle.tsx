"use client";

import { Box, CircularProgress } from "@mui/material";
import type { EntityStatus } from "@/services/api/catalog";

type EntityStatusToggleProps = {
  status: EntityStatus;
  disabled?: boolean;
  loading?: boolean;
  compact?: boolean;
  onToggle: (next: EntityStatus) => void;
};

const OPTIONS: { value: EntityStatus; label: string }[] = [
  { value: "Active", label: "Ativo" },
  { value: "Inactive", label: "Inativo" },
];

export function EntityStatusToggle({
  status,
  disabled,
  loading,
  compact = false,
  onToggle,
}: EntityStatusToggleProps) {
  const active = status === "Active";

  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
      <Box
        role="group"
        aria-label="Status"
        sx={{
          display: "inline-flex",
          borderRadius: "10px",
          border: "1px solid #e5e7eb",
          bgcolor: "#f9fafb",
          p: "3px",
          gap: "2px",
          opacity: disabled ? 0.55 : 1,
          pointerEvents: disabled || loading ? "none" : "auto",
        }}
      >
        {OPTIONS.map((option) => {
          const isActiveOption = option.value === "Active";
          const selected =
            (isActiveOption && active) || (!isActiveOption && !active);

          return (
            <Box
              key={option.value}
              component="button"
              type="button"
              disabled={disabled || loading}
              onClick={() => onToggle(option.value)}
              sx={{
                border: "none",
                borderRadius: "8px",
                px: compact ? 1.25 : 1.75,
                py: compact ? 0.5 : 0.75,
                fontSize: compact ? "0.7rem" : "0.75rem",
                fontWeight: 600,
                lineHeight: 1.4,
                cursor: "pointer",
                transition: "all 0.15s ease",
                bgcolor: selected
                  ? isActiveOption
                    ? "#ecfdf5"
                    : "#f3f4f6"
                  : "transparent",
                color: selected
                  ? isActiveOption
                    ? "#047857"
                    : "#4b5563"
                  : "#9ca3af",
                boxShadow: selected ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
                "&:hover": {
                  bgcolor: selected
                    ? undefined
                    : isActiveOption
                      ? "rgba(16, 185, 129, 0.08)"
                      : "rgba(107, 114, 128, 0.08)",
                  color: selected ? undefined : "#4b5563",
                },
              }}
            >
              {option.label}
            </Box>
          );
        })}
      </Box>
      {loading && <CircularProgress size={14} thickness={5} />}
    </Box>
  );
}
