"use client";

import { Box } from "@mui/material";
import YouTube from "react-youtube";

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
      <Box sx={{ position: "absolute", inset: 0 }}>
        <YouTube
          videoId={resolvedVideoId}
          opts={{
            width: "100%",
            height: "100%",
            playerVars: {
              modestbranding: 1,
              rel: 0,
            },
          }}
          style={{ width: "100%", height: "100%" }}
          title={title}
        />
      </Box>
    </Box>
  );
}
