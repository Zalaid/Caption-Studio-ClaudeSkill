#!/usr/bin/env python3
"""Transcribe a video/audio file to word-level timestamps.

Output JSON contains both a flat ``words`` array (one entry per spoken word,
times in seconds) and a Remotion-native ``captions`` array (one entry per word,
times in milliseconds) ready to feed straight into the renderer.

Usage:
    python transcribe.py INPUT.mp4 --output words.json
    python transcribe.py INPUT.mp4 --output words.json --model large-v3 --device cuda
"""

from __future__ import annotations

import argparse
import json
import sys
import time
from pathlib import Path


def pick_device(requested: str) -> str:
    if requested != "auto":
        return requested
    try:
        import ctranslate2  # bundled with faster-whisper

        if ctranslate2.get_cuda_device_count() > 0:
            return "cuda"
    except Exception:
        pass
    return "cpu"


def pick_compute_type(requested: str, device: str) -> str:
    if requested != "auto":
        return requested
    return "float16" if device == "cuda" else "int8"


def main() -> int:
    parser = argparse.ArgumentParser(description="Word-level transcription with faster-whisper.")
    parser.add_argument("input", help="Input video or audio file.")
    parser.add_argument("--output", required=True, help="Output JSON path (e.g. words.json).")
    parser.add_argument("--model", default="large-v3", help="Whisper model size (default: large-v3).")
    parser.add_argument("--device", default="auto", choices=["auto", "cuda", "cpu"], help="Compute device.")
    parser.add_argument(
        "--compute-type",
        default="auto",
        choices=["auto", "float16", "int8", "int8_float16", "float32"],
        help="CTranslate2 compute type.",
    )
    parser.add_argument("--language", default=None, help="Force a language code (e.g. en). Default: auto-detect.")
    args = parser.parse_args()

    src = Path(args.input)
    if not src.exists():
        print(f"error: input not found: {src}", file=sys.stderr)
        return 1

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        print("error: faster-whisper is not installed. Run setup.sh or 'pip install -r requirements.txt'.", file=sys.stderr)
        return 1

    device = pick_device(args.device)
    compute_type = pick_compute_type(args.compute_type, device)

    print(f"[transcribe] model={args.model} device={device} compute_type={compute_type}", file=sys.stderr)
    started = time.time()

    model = WhisperModel(args.model, device=device, compute_type=compute_type)
    segments_iter, info = model.transcribe(
        str(src),
        language=args.language,
        word_timestamps=True,
        vad_filter=True,
    )

    words: list[dict] = []
    captions: list[dict] = []
    segments: list[dict] = []

    for seg in segments_iter:
        seg_words = []
        for w in seg.words or []:
            text = w.word.strip()
            if not text:
                continue
            entry = {"word": text, "start": round(w.start, 3), "end": round(w.end, 3)}
            words.append(entry)
            seg_words.append(entry)
            captions.append(
                {
                    "text": text,
                    "startMs": int(round(w.start * 1000)),
                    "endMs": int(round(w.end * 1000)),
                }
            )
        segments.append(
            {
                "start": round(seg.start, 3),
                "end": round(seg.end, 3),
                "text": seg.text.strip(),
                "words": seg_words,
            }
        )

    elapsed = round(time.time() - started, 2)

    payload = {
        "language": info.language,
        "language_probability": round(info.language_probability, 3),
        "duration": round(info.duration, 3),
        "word_count": len(words),
        "model": args.model,
        "device": device,
        "compute_type": compute_type,
        "transcription_time_sec": elapsed,
        "segments": segments,
        "words": words,
        "captions": captions,
    }

    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"[transcribe] {len(words)} words in {elapsed}s -> {out}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
