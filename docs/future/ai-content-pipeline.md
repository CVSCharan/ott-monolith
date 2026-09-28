# Future: AI Content Pipeline (Phase 2)

> This document describes the planned Phase 2 AI-assisted content processing pipeline.
> It has been moved here from `07-video-pipeline.md` to keep the Phase 1 pipeline doc focused.

## Overview

When an admin uploads a video without complete metadata, the AI pipeline can:

1. `ffprobe` → extract duration, codec info, resolution
2. FFmpeg → extract frames at 1fps
3. Gemini Vision API → describe scenes, suggest title/description
4. LangChain summarization chain → auto-fill metadata form
5. Whisper / Gemini STT → auto-generate subtitles (SRT)
6. Admin reviews and approves before publishing

## Status

**Not built in Phase 1.** Placeholder for implementation planning.

## Dependencies (Phase 2)

- `@google/generative-ai` (Gemini API)
- `langchain` + `@langchain/google-genai`
- Whisper API or self-hosted model
- Separate pg-boss job type: `ai-metadata`
