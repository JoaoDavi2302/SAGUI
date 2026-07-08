"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Box, Breadcrumbs, Typography } from "@mui/material";
import { ArrowBack, NavigateNext } from "@mui/icons-material";

export type AdminCourseCrumb = {
  label: string;
  href?: string;
};

type AdminCourseNavProps = {
  backHref: string;
  backLabel?: string;
  items: AdminCourseCrumb[];
};

export function AdminCourseNav({
  backHref,
  backLabel = "Voltar",
  items,
}: AdminCourseNavProps) {
  const router = useRouter();

  return (
    <Box sx={{ mb: 3 }}>
      <Breadcrumbs
        separator={<NavigateNext fontSize="small" />}
        sx={{ fontSize: "0.875rem", mb: 1.5 }}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          if (!isLast && item.href) {
            return (
              <Link
                key={`${item.label}-${index}`}
                href={item.href}
                style={{ color: "inherit", textDecoration: "none" }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    "&:hover": { color: "primary.main", textDecoration: "underline" },
                  }}
                >
                  {item.label}
                </Typography>
              </Link>
            );
          }

          return (
            <Typography
              key={`${item.label}-${index}`}
              variant="body2"
              color="text.primary"
              sx={{ fontWeight: isLast ? 600 : 400 }}
            >
              {item.label}
            </Typography>
          );
        })}
      </Breadcrumbs>

      <Box
        component="button"
        type="button"
        onClick={() => router.push(backHref)}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.75,
          border: "none",
          bgcolor: "transparent",
          color: "text.secondary",
          cursor: "pointer",
          p: 0,
          fontSize: "0.875rem",
          fontFamily: "inherit",
          "&:hover": { color: "primary.main" },
        }}
      >
        <ArrowBack sx={{ fontSize: 18 }} />
        {backLabel}
      </Box>
    </Box>
  );
}

export const adminCourseListCrumbs: AdminCourseCrumb[] = [
  { label: "Painel", href: "/dashboard" },
  { label: "Gerenciamento de cursos" },
];

export function adminCourseDetailCrumbs(courseName: string): AdminCourseCrumb[] {
  return [
    { label: "Painel", href: "/dashboard" },
    { label: "Gerenciamento de cursos", href: "/dashboard/cursos" },
    { label: courseName },
  ];
}
