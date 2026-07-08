"use client";

import { Box } from "@mui/material";

import { getYouTubeId } from "@/utils/youtube";

interface YouTubeAttachmentPlayerProps {
  fileUrl: string;
  videoId?: string | null;
  title?: string;
}

export function YouTubeAttachmentPlayer({
  fileUrl,
  videoId,
  title,
}: YouTubeAttachmentPlayerProps) {
  const resolvedVideoId = videoId ?? getYouTubeId(fileUrl);

  if (!resolvedVideoId) {
    return null;
  }

  const embedUrl = `https://www.youtube-nocookie.com/embed/${resolvedVideoId}?rel=0&modestbranding=1`;

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        pt: "56.25%",
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "#000",
      }}
    >
      <Box
        component="iframe"
        title={title || "Vídeo do YouTube"}
        src={embedUrl}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        sx={{
          position: "absolute",
          inset: 0,
          border: 0,
          width: "100%",
          height: "100%",
        }}
      />
    </Box>
  );
}
