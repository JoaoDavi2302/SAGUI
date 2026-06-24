"use client"
import { useUser } from "@/services/AuthContext";
import { Box, Typography } from "@mui/material";

// homepage
export default function Home() {
  const { user } = useUser();
  return (
    <Box>
      <Typography sx={{fontFamily:"system-ui", fontSize:"12px"}}>Inicio</Typography>
      <Typography variant="h4" sx={{fontFamily:"system-ui", fontWeight:"bold"}}>Olá, {user?.name}</Typography>
    </Box>
  );
}
