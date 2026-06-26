#!/usr/bin/env python3
"""
Limpia dumps pg_dump con stderr mezclado en stdout.

Problemas que corrige:
- Líneas pg_dump: antes/durante el SQL
- pg_dump: \\. falso dentro de un COPY (no cierra el bloque)
- Cabeceras COPY de otra tabla incrustadas en datos
- Comentarios -- y líneas dumping contents of table dentro de COPY
"""

from __future__ import annotations

import gzip
import re
import sys
from pathlib import Path

COPY_START_RE = re.compile(r"^COPY public\.")

JUNK_OUTSIDE_PREFIXES = (
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

JUNK_IN_COPY_PREFIXES = (
    "pg_dump:",
    "dumping contents of table",
    "processing data for table",
)


def open_input(path: Path):
    if path.suffix == ".gz" or path.name.endswith(".sql.gz"):
        return gzip.open(path, "rt", encoding="utf-8", errors="replace")
    return path.open("r", encoding="utf-8", errors="replace")


def is_junk_outside(line: str) -> bool:
    stripped = line.strip()
    if not stripped:
        return True
    if line.startswith("--"):
        return True
    return line.startswith(JUNK_OUTSIDE_PREFIXES)


def is_junk_in_copy(line: str) -> bool:
    stripped = line.strip()
    if not stripped:
        return True
    if line.startswith("--"):
        return True
    if line.startswith(JUNK_IN_COPY_PREFIXES):
        return True
    first = line.split("\t", 1)[0].strip()
    if first == "":
        return True
    return False


def clean_stream(src: Path, dst: Path) -> dict[str, int]:
    stats = {"skipped": 0, "copy_blocks_closed": 0, "unclosed_fixed": 0}
    in_copy = False

    with open_input(src) as f, dst.open("w", encoding="utf-8") as out:
        for line in f:
            stripped = line.strip()

            if not in_copy:
                if COPY_START_RE.match(line):
                    in_copy = True
                    out.write(line)
                    continue
                if is_junk_outside(line):
                    stats["skipped"] += 1
                    continue
                out.write(line)
                continue

            # Dentro de un bloque COPY
            if stripped == r"\.":
                in_copy = False
                out.write(line)
                continue

            if COPY_START_RE.match(line):
                out.write("\\.\n")
                stats["copy_blocks_closed"] += 1
                out.write(line)
                continue

            if is_junk_in_copy(line):
                stats["skipped"] += 1
                continue

            out.write(line)

        if in_copy:
            out.write("\\.\n")
            stats["unclosed_fixed"] += 1

    return stats


def count_copy_rows(path: Path, table: str) -> int:
    count = 0
    in_copy = False
    with path.open("r", encoding="utf-8", errors="replace") as f:
        for line in f:
            if line.startswith(f"COPY public.{table} "):
                in_copy = True
                continue
            if in_copy:
                if line.strip() == r"\.":
                    break
                count += 1
    return count


def main() -> int:
    if len(sys.argv) not in (3, 4):
        print(
            f"Uso: {sys.argv[0]} entrada.sql[.gz] salida.sql [--verify]",
            file=sys.stderr,
        )
        return 1

    src = Path(sys.argv[1])
    dst = Path(sys.argv[2])
    verify = len(sys.argv) == 4 and sys.argv[3] == "--verify"

    if not src.is_file():
        print(f"No existe: {src}", file=sys.stderr)
        return 1

    stats = clean_stream(src, dst)
    print(
        f"OK: {dst} ({dst.stat().st_size} bytes, "
        f"{stats['skipped']} líneas omitidas, "
        f"{stats['copy_blocks_closed']} COPY re-cerrados, "
        f"{stats['unclosed_fixed']} COPY cerrados al final)"
    )

    if verify:
        tickets = count_copy_rows(dst, "tickets")
        piezas = count_copy_rows(dst, "piezas_reparacion_productos")
        precios = count_copy_rows(dst, "precios_venta")
        print(f"Verificación: tickets={tickets}, piezas={piezas}, precios_venta={precios}")

        leaked = 0
        in_copy = False
        with dst.open("r", encoding="utf-8") as f:
            for line in f:
                if COPY_START_RE.match(line):
                    in_copy = True
                    continue
                if in_copy:
                    if line.strip() == r"\.":
                        in_copy = False
                        continue
                    if COPY_START_RE.match(line) or line.startswith("pg_dump:"):
                        leaked += 1
        print(f"Líneas basura dentro de COPY: {leaked}")
        if leaked > 0:
            return 2

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
