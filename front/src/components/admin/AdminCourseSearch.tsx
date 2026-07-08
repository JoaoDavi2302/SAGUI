"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  CircularProgress,
  InputBase,
  List,
  ListItemButton,
  Paper,
  Typography,
  alpha,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SchoolOutlined from "@mui/icons-material/SchoolOutlined";
import {
  type CourseDTO,
  listCourses,
} from "@/new-services/poo/shared/api/catalog";

const PREVIEW_LIMIT = 6;

function filterCourses(courses: CourseDTO[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return courses.filter((course) => {
    const name = (course.name ?? "").toLowerCase();
    const description = (course.description ?? "").toLowerCase();
    return name.includes(normalized) || description.includes(normalized);
  });
}

export default function AdminCourseSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const isCoursePage = pathname.startsWith("/dashboard/cursos");

  const [query, setQuery] = React.useState("");
  const [courses, setCourses] = React.useState<CourseDTO[]>([]);
  const [loadingCourses, setLoadingCourses] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);

  React.useEffect(() => {
    setQuery(isCoursePage ? (searchParams.get("q") ?? "") : "");
  }, [searchParams, isCoursePage]);

  React.useEffect(() => {
    let cancelled = false;

    listCourses()
      .then((data) => {
        if (!cancelled) setCourses(data);
      })
      .finally(() => {
        if (!cancelled) setLoadingCourses(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const matches = React.useMemo(
    () => filterCourses(courses, query),
    [courses, query],
  );

  const preview = matches.slice(0, PREVIEW_LIMIT);
  const hasQuery = query.trim().length > 0;
  const showDropdown = open && hasQuery;

  function closeDropdown() {
    setOpen(false);
    setActiveIndex(-1);
  }

  function goToCourse(courseId: string) {
    closeDropdown();
    router.push(`/dashboard/cursos/${courseId}`);
  }

  function goToSearchResults() {
    const trimmed = query.trim();
    closeDropdown();
    router.push(
      trimmed
        ? `/dashboard/cursos?q=${encodeURIComponent(trimmed)}`
        : "/dashboard/cursos",
    );
  }

  React.useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        closeDropdown();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <Box
      ref={containerRef}
      component="form"
      onSubmit={(event) => {
        event.preventDefault();
        if (activeIndex >= 0 && preview[activeIndex]) {
          goToCourse(preview[activeIndex].id);
          return;
        }
        goToSearchResults();
      }}
      sx={{ position: "relative", width: "100%" }}
    >
      <Box
        sx={(theme) => ({
          display: "flex",
          alignItems: "center",
          width: "100%",
          height: 44,
          borderRadius: "12px",
          px: 1.5,
          bgcolor: alpha(theme.palette.common.white, 0.14),
          border: `1px solid ${alpha(theme.palette.common.white, 0.18)}`,
          transition: theme.transitions.create(["background-color", "border-color", "box-shadow"]),
          "&:hover": {
            bgcolor: alpha(theme.palette.common.white, 0.2),
          },
          "&:focus-within": {
            bgcolor: alpha(theme.palette.common.white, 0.22),
            borderColor: alpha(theme.palette.common.white, 0.35),
            boxShadow: `0 0 0 3px ${alpha(theme.palette.common.white, 0.12)}`,
          },
        })}
      >
        <SearchIcon sx={{ fontSize: 20, opacity: 0.85, mr: 1 }} />
        <InputBase
          placeholder="Pesquisar cursos..."
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => {
            if (hasQuery) setOpen(true);
          }}
          onKeyDown={(event) => {
            if (!showDropdown || preview.length === 0) return;

            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((current) =>
                current < preview.length - 1 ? current + 1 : 0,
              );
            }

            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((current) =>
                current > 0 ? current - 1 : preview.length - 1,
              );
            }

            if (event.key === "Escape") {
              closeDropdown();
            }
          }}
          inputProps={{ "aria-label": "Pesquisar cursos", "aria-expanded": showDropdown }}
          sx={{
            flex: 1,
            color: "inherit",
            fontSize: "0.95rem",
            "& input": {
              py: 0,
              "&::placeholder": {
                color: "inherit",
                opacity: 0.72,
              },
            },
          }}
        />
        {loadingCourses && (
          <CircularProgress size={16} color="inherit" sx={{ opacity: 0.8 }} />
        )}
      </Box>

      {showDropdown ? (
        <Paper
          elevation={8}
          sx={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            right: 0,
            overflow: "hidden",
            borderRadius: 2,
            zIndex: (theme) => theme.zIndex.modal,
          }}
        >
          {loadingCourses ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={22} />
            </Box>
          ) : matches.length === 0 ? (
            <Box sx={{ px: 2, py: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Nenhum curso encontrado.
              </Typography>
            </Box>
          ) : (
            <List dense disablePadding>
              {preview.map((course, index) => (
                <ListItemButton
                  key={course.id}
                  selected={index === activeIndex}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => goToCourse(course.id)}
                  sx={{ alignItems: "flex-start", py: 1.25 }}
                >
                  <SchoolOutlined
                    fontSize="small"
                    sx={{ mt: 0.35, mr: 1.5, color: "primary.main" }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                      {course.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: 12,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {course.description
                        ? course.description.length > 72
                          ? `${course.description.slice(0, 72)}...`
                          : course.description
                        : "Sem descrição"}
                    </Typography>
                  </Box>
                </ListItemButton>
              ))}

              {matches.length > PREVIEW_LIMIT ? (
                <ListItemButton
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={goToSearchResults}
                  sx={{
                    justifyContent: "center",
                    borderTop: 1,
                    borderColor: "divider",
                    py: 1.25,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="primary"
                    sx={{ fontWeight: 600 }}
                  >
                    Ver todos os {matches.length} resultados
                  </Typography>
                </ListItemButton>
              ) : null}
            </List>
          )}
        </Paper>
      ) : null}
    </Box>
  );
}
