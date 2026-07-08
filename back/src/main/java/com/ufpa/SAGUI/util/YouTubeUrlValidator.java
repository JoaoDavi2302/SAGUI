package com.ufpa.SAGUI.util;

import java.net.URI;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class YouTubeUrlValidator {

    private static final Pattern WATCH_PATTERN = Pattern.compile(
            "(?:youtube\\.com/watch\\?.*v=|youtube\\.com/embed/|youtu\\.be/)([a-zA-Z0-9_-]{11})");

    private YouTubeUrlValidator() {
    }

    public static boolean isValidYouTubeUrl(String url) {
        return extractVideoId(url).isPresent();
    }

    public static Optional<String> extractVideoId(String url) {
        if (url == null || url.isBlank()) {
            return Optional.empty();
        }

        try {
            URI uri = URI.create(url.trim());
            String host = uri.getHost();
            if (host == null) {
                return Optional.empty();
            }

            host = host.toLowerCase();
            if (!host.equals("youtu.be") && !host.endsWith("youtube.com")) {
                return Optional.empty();
            }

            Matcher matcher = WATCH_PATTERN.matcher(url.trim());
            if (matcher.find()) {
                return Optional.of(matcher.group(1));
            }
        } catch (IllegalArgumentException ignored) {
            return Optional.empty();
        }

        return Optional.empty();
    }
}
