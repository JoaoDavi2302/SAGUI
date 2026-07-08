"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import { getCourse } from "@/new-services/poo/shared/api/courses";

interface Props {
  open: boolean;
  courseId?: string;
  onClose: () => void;
}

export default function CourseViewModal({ open, courseId, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!open || !courseId) return;

    const load = async () => {
      setLoading(true);
      try {
        const course = await getCourse(courseId);
        setName(course.name);
        setDescription(course.description);
        setStatus(course.status);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [open, courseId]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Detalhes do curso</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ py: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {name}
            </Typography>
            <Chip label={status} size="small" sx={{ my: 1 }} />
            <Typography color="text.secondary">{description}</Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
