#!/usr/bin/env python3
"""Optional: forced alignment of a KNOWN script to audio.

Use this only when you have a separate clean voice track (e.g. TTS) and the exact
script text. It pins the *words* to your script and takes only the *timing* from
the audio, so numbers and names can never be misheard.

For mixed voice + SFX audio, prefer transcribe.py + a quick manual check of the
transcript against your written script (see SKILL.md). This script is the
back-pocket option, not the default path.

Usage:
    python align.py INPUT.mp4 --script script.txt --output words.json

Requires whisperx:  pip install whisperx
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(description="Forced alignment of a known script to audio.")
    parser.add_argument("input", help="Input video or audio file.")
    parser.add_argument("--script", required=True, help="Plain-text file with the exact narration script.")
    parser.add_argument("--output", required=True, help="Output JSON path (same schema as transcribe.py).")
    parser.add_argument("--device", default="cuda", choices=["cuda", "cpu"])
    parser.add_argument("--language", default="en")
    args = parser.parse_args()

    try:
        import whisperx  # type: ignore
    except ImportError:
        print(
            "error: whisperx is not installed. Install it with 'pip install whisperx',\n"
            "       or use scripts/transcribe.py and verify the transcript manually instead.",
            file=sys.stderr,
        )
        return 1

    src = Path(args.input)
    script_text = Path(args.script).read_text(encoding="utf-8").strip()
    if not src.exists() or not script_text:
        print("error: missing input file or empty script.", file=sys.stderr)
        return 1

    audio = whisperx.load_audio(str(src))
    model_a, metadata = whisperx.load_align_model(language_code=args.language, device=args.device)

    # Treat the whole script as one segment spanning the audio; whisperx aligns word boundaries.
    duration = len(audio) / 16000.0
    segments = [{"text": script_text, "start": 0.0, "end": duration}]
    aligned = whisperx.align(segments, model_a, metadata, audio, args.device, return_char_alignments=False)

    words: list[dict] = []
    captions: list[dict] = []
    for w in aligned.get("word_segments", []):
        text = str(w.get("word", "")).strip()
        if not text or "start" not in w or "end" not in w:
            continue
        words.append({"word": text, "start": round(w["start"], 3), "end": round(w["end"], 3)})
        captions.append(
            {"text": text, "startMs": int(round(w["start"] * 1000)), "endMs": int(round(w["end"] * 1000))}
        )

    payload = {
        "language": args.language,
        "duration": round(duration, 3),
        "word_count": len(words),
        "model": "whisperx-align",
        "device": args.device,
        "source": "forced-alignment",
        "words": words,
        "captions": captions,
    }
    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[align] {len(words)} words -> {out}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
