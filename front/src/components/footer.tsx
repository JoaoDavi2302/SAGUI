"use client";

import Link from "next/link";
import "./styles.css"

import { Box, Container, Grid, Typography, Stack } from "@mui/material";

export default function Footer() {
  return (
    <Box
      component="footer"
      className="box-footer"
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
              }}
              gutterBottom
            >
              SAGUI
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Sistema Aberto de Gestão Universitária Institucional
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 600,
              }}
              gutterBottom
            >
              Serviços
            </Typography>

            {/* para alterar */}
            <Stack spacing={1}>
              <Link
                href="/sobre"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Sobre
                </Typography>
              </Link>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
