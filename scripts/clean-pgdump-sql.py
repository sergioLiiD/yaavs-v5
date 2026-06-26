#!/usr/bin/env python3
"""Limpia dumps pg_dump con stderr mezclado (pg_dump:, creating, --, etc.)."""

import gzip
import sys
from pathlib import Path

JUNK_PREFIXES = (
    "pg_dump:",
    "creating ",
    "dumping ",
    "processing ",
    "reading ",
    "identifying ",
    "finding ",
    "flagging ",
    "selecting ",
    "executing ",
    "saving ",
    "querying ",
    "last built-in",
    "\\restrict ",
    "\\unrestrict ",
)


def open_input(path: Path):
    if path.suffix == ".gz" or path.name.endswith(".sql.gz"):
        return gzip.open(path, "rt", encoding="utf-8", errors="replace")
    return path.open("r", encoding="utf-8", errors="replace")


def is_junk(line: str, in_copy: bool = False) -> bool:
    stripped = line.strip()
    if not stripped:
        return True
    if line.startswith("--"):
        return True
    if line.startswith(JUNK_PREFIXES):
        return True
    if in_copy and line.split("\t", 1)[0].strip() == "":
        return True
    return False


def clean_stream(src: Path, dst: Path) -> int:
    skipped = 0
    in_copy = False

    with open_input(src) as f, dst.open("w", encoding="utf-8") as out:
        for line in f:
            if line.startswith("COPY public."):
                in_copy = True
                out.write(line)
                continue

            if in_copy:
                if line.strip() == "\\.":
                    in_copy = False
                    out.write(line)
                    continue
                if is_junk(line, in_copy=True):
                    skipped += 1
                    continue
                out.write(line)
                continue

            if is_junk(line):
                skipped += 1
                continue
            out.write(line)

    return skipped


def main() -> int:
    if len(sys.argv) != 3:
        print(f"Uso: {sys.argv[0]} entrada.sql[.gz] salida.sql", file=sys.stderr)
        return 1

    src = Path(sys.argv[1])
    dst = Path(sys.argv[2])
    if not src.is_file():
        print(f"No existe: {src}", file=sys.stderr)
        return 1

    skipped = clean_stream(src, dst)
    print(f"OK: {dst} ({dst.stat().st_size} bytes, {skipped} líneas omitidas)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
