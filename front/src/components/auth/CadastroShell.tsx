"use client";

import Image from "next/image";
import Logo from "../../../public/Longa-logo.svg";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

type Props = {
  children: React.ReactNode;
};

export default function CadastroShell({ children }: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

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
      <Card
        sx={{
          width: "100%",
          maxWidth: 900,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          borderRadius: 2,
          p: 1,
          border: "2px solid rgba(0,0,0,0.3)",
        }}
      >
        <Box
          sx={{
            flex: isMobile ? "none" : "0 0 38%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            px: 3,
            py: isMobile ? 3 : 4,
          }}
        >
          <Image
            src={Logo}
            alt="SAGUI"
            style={{
              width: "200px",
              maxWidth: "100%",
              height: "auto",
              marginBottom: "-8px",
            }}
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
        </Box>

        {isMobile ? <Divider /> : <Divider orientation="vertical" flexItem />}

        <CardContent
          sx={{
            flex: 1,
            px: { xs: 2, md: 3 },
            py: { xs: 2, md: 3 },
            "&:last-child": { pb: { xs: 2, md: 3 } },
          }}
        >
          {children}
        </CardContent>
      </Card>
    </Box>
  );
}
