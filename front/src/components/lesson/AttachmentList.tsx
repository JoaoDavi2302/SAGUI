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
  compact?: boolean;
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
  compact = false,
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
      <Box sx={{ py: compact ? 2 : 4, textAlign: "center", color: "text.secondary" }}>
        Nenhum material disponível.
      </Box>
    );
  }

  return (
    <Stack spacing={compact ? 1.5 : 2}>
      {attachments.map((attachment) => {
        const isVideo = attachment.attachmentType === "VIDEO";

        if (compact && isVideo) {
          return (
            <Box
              key={attachment.id}
              sx={{
                width: "100%",
                maxHeight: { xs: "none", md: 400 },
                overflow: "hidden",
                borderRadius: 2,
              }}
            >
              <YouTubeAttachmentPlayer
                fileUrl={attachment.fileUrl}
                videoId={attachment.videoId}
                title={attachment.name}
              />
            </Box>
          );
        }

        return (
        <Card
          key={attachment.id}
          variant="outlined"
          sx={{ borderRadius: compact ? 2 : 3, boxShadow: "none" }}
        >
          <CardContent sx={{ p: compact ? 1.5 : undefined, "&:last-child": { pb: compact ? 1.5 : undefined } }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: isVideo ? (compact ? 1 : 2) : 0,
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
                  mt: compact ? 1 : 2,
                  width: "100%",
                  maxHeight: compact ? 280 : 360,
                  objectFit: "contain",
                  borderRadius: 2,
                  bgcolor: "#f8fafc",
                }}
              />
            )}
          </CardContent>
        </Card>
        );
      })}
    </Stack>
  );
}
