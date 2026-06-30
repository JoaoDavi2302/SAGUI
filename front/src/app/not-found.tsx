"use client";

import Link from "next/link";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
} from "@mui/material";

import { SearchOffOutlined, HomeOutlined } from "@mui/icons-material";

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: 3,

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        backgroundColor: "#fafafa",
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 560,
          borderRadius: 4,
          boxShadow: "0 8px 24px rgba(0,0,0,.06)",
        }}
      >
        <CardContent
          sx={{
            p: 5,
          }}
        >
          <Stack
            spacing={3}
            sx={{
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                width: 84,
                height: 84,

                bgcolor: "#add3f8",

                borderRadius: 3,

                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SearchOffOutlined
                sx={{
                  fontSize: 42,
                  color: "#1976d2",
                }}
              />
            </Box>

            <Box sx={{ textAlign: "center" }}>
              <Typography
                sx={{
                  fontSize: 42,
                  fontWeight: 700,
                }}
              >
                404
              </Typography>

              <Typography
                sx={{
                  fontSize: 24,
                  fontWeight: 600,
                  mt: 1,
                }}
              >
                Página não encontrada
              </Typography>

              <Typography
                sx={{
                  mt: 2,
                  color: "text.secondary",
                }}
              >
                O endereço informado não existe ou você não possui permissão
                para acessar este conteúdo.
              </Typography>
            </Box>

            <Button
              component={Link}
              href="/"
              variant="contained"
              startIcon={<HomeOutlined />}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.2,
              }}
            >
              Voltar ao início
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
