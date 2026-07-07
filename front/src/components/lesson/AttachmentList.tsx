"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import {
  DescriptionOutlined,
  ImageOutlined,
  PlayCircleOutlined,
} from "@mui/icons-material";

import type { AttachmentDTO } from "@/new-services/poo/shared/api/attachments";
import { YouTubeAttachmentPlayer } from "@/components/lesson/YouTubeAttachmentPlayer";

interface AttachmentListProps {
  attachments: AttachmentDTO[];
  loading?: boolean;
  error?: string | null;
}

function typeIcon(type: AttachmentDTO["attachmentType"]) {
  switch (type) {
    case "VIDEO":
      return <PlayCircleOutlined />;
    case "IMAGE":
      return <ImageOutlined />;
    default:
      return <DescriptionOutlined />;
  }
}

export function AttachmentList({
  attachments,
  loading,
  error,
}: AttachmentListProps) {
  if (loading) {
    return (
      <Typography color="text.secondary">Carregando materiais...</Typography>
    );
  }

  if (error) {
    return (
      <Typography color="error">{error}</Typography>
    );
  }

  if (attachments.length === 0) {
    return (
      <Box
        sx={{
          py: 4,
          textAlign: "center",
          color: "text.secondary",
        }}
      >
        Nenhum material disponível.
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      {attachments.map((attachment) => (
        <Card key={attachment.id} variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: attachment.attachmentType === "VIDEO" ? 2 : 0,
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: "#e8f0f5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "primary.main",
                }}
              >
                {typeIcon(attachment.attachmentType)}
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 600 }}>
                  {attachment.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {attachment.attachmentType}
                </Typography>
              </Box>

              {attachment.attachmentType !== "VIDEO" && (
                <Button
                  href={attachment.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  size="small"
                >
                  Abrir
                </Button>
              )}
            </Box>

            {attachment.attachmentType === "VIDEO" && (
              <YouTubeAttachmentPlayer
                fileUrl={attachment.fileUrl}
                videoId={attachment.videoId}
                title={attachment.name}
              />
            )}

            {attachment.attachmentType === "IMAGE" && (
              <Box
                component="img"
                src={attachment.fileUrl}
                alt={attachment.name}
                sx={{
                  mt: 2,
                  width: "100%",
                  maxHeight: 360,
                  objectFit: "contain",
                  borderRadius: 2,
                  bgcolor: "#f8fafc",
                }}
              />
            )}
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
