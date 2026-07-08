"use client";

import { IconButton, Stack, Tooltip } from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

interface ReorderButtonsProps {
  onMoveUp: () => void;
  onMoveDown: () => void;
  disableUp?: boolean;
  disableDown?: boolean;
  disabled?: boolean;
}

export function ReorderButtons({
  onMoveUp,
  onMoveDown,
  disableUp = false,
  disableDown = false,
  disabled = false,
}: ReorderButtonsProps) {
  return (
    <Stack direction="column" spacing={0} onClick={(event) => event.stopPropagation()}>
      <Tooltip title="Mover para cima">
        <span>
          <IconButton
            size="small"
            onClick={onMoveUp}
            disabled={disabled || disableUp}
            aria-label="Mover para cima"
            sx={{ p: 0.25 }}
          >
            <KeyboardArrowUp fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Mover para baixo">
        <span>
          <IconButton
            size="small"
            onClick={onMoveDown}
            disabled={disabled || disableDown}
            aria-label="Mover para baixo"
            sx={{ p: 0.25 }}
          >
            <KeyboardArrowDown fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
}
