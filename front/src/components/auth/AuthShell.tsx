import Image from "next/image";
import Logo from "../../../public/Longa-logo.svg";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";

type Props = {
  children: React.ReactNode;
  cardWidth?: number;
};

export default function AuthShell({ children, cardWidth = 380 }: Props) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9fafb",
        px: 2,
        py: 4,
      }}
    >
      <Stack spacing={0.5} sx={{ mb: 2 }}>
        <Image
          src={Logo}
          alt="SAGUI"
          style={{ width: "220px", alignSelf: "center", marginBottom: "-15px" }}
        />
        <Typography
          sx={{
            fontFamily: "system-ui",
            fontWeight: 400,
            fontSize: "16px",
            color: "#556255",
            textAlign: "center",
          }}
        >
          Plataforma academica de estudos
        </Typography>
      </Stack>

      <Card
        sx={{
          width: cardWidth,
          maxWidth: "100%",
          borderRadius: 2,
          p: 1,
          border: "2px solid rgba(0,0,0,0.3)",
        }}
      >
        <CardContent>{children}</CardContent>
      </Card>
    </Box>
  );
}
