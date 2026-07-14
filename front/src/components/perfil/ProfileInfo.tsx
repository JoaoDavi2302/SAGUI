"use client";

import { Box, Paper, Typography, Avatar, Divider, Stack } from "@mui/material";
import { LoggedUser } from "@/new-services/poo/shared/types";
import { Role } from "@/new-services/poo/shared/types";

interface ProfileInfoProps {
  user: LoggedUser;
  role: Role;
}

export default function ProfileInfo({ user, role }: ProfileInfoProps) {
  return (
    <Paper sx={{ p: 3, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 3 }}>
      <Avatar 
        sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}
      >
        {user.name.charAt(0).toUpperCase()}
      </Avatar>
      
      <Stack spacing={0.5}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {user.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {user.email}
        </Typography>
        <Box 
          sx={{ 
            px: 1.5, 
            py: 0.5, 
            borderRadius: 1, 
            bgcolor: 'primary.light', 
            color: 'primary.contrastText',
            display: 'inline-block',
            width: 'fit-content',
            fontSize: '0.75rem',
            fontWeight: 'bold'
          }}
        >
          {role}
        </Box>
      </Stack>
    </Paper>
  );
}