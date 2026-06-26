#!/usr/bin/env python3
"""Envía un backup .sql.gz por correo usando SMTP del .env del servidor."""

from __future__ import annotations

import os
import smtplib
import sys
from datetime import datetime
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path


def load_env(path: Path) -> dict[str, str]:
    env: dict[str, str] = {}
    if not path.is_file():
        return env
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        env[key.strip()] = value.strip().strip('"').strip("'")
    return env


def main() -> int:
    if len(sys.argv) < 2:
        print("Uso: send-backup-email.py <backup.sql.gz> [.env]", file=sys.stderr)
        return 1

    backup_path = Path(sys.argv[1])
    env_path = Path(sys.argv[2]) if len(sys.argv) > 2 else Path(".env")

    if not backup_path.is_file():
        print(f"Error: no existe {backup_path}", file=sys.stderr)
        return 1

    env = {**load_env(env_path), **os.environ}

    host = env.get("SMTP_HOST", "")
    port = int(env.get("SMTP_PORT", "587"))
    user = env.get("SMTP_USER", "")
    password = env.get("SMTP_PASS", "")
    to_addr = env.get("BACKUP_EMAIL_TO", "")
    from_addr = env.get("BACKUP_EMAIL_FROM", user)

    missing = [
        name
        for name, val in [
            ("SMTP_HOST", host),
            ("SMTP_USER", user),
            ("SMTP_PASS", password),
            ("BACKUP_EMAIL_TO", to_addr),
        ]
        if not val
    ]
    if missing:
        print(
            "Error: faltan variables en .env: " + ", ".join(missing),
            file=sys.stderr,
        )
        print(
            "Ejemplo:\n"
            "  SMTP_HOST=smtp.gmail.com\n"
            "  SMTP_PORT=587\n"
            "  SMTP_USER=tu@gmail.com\n"
            "  SMTP_PASS=contraseña_de_aplicacion\n"
            "  BACKUP_EMAIL_TO=destino@ejemplo.com",
            file=sys.stderr,
        )
        return 1

    size_kb = backup_path.stat().st_size / 1024
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    msg = MIMEMultipart()
    msg["Subject"] = f"YAAVS backup {backup_path.name}"
    msg["From"] = from_addr
    msg["To"] = to_addr
    msg.attach(
        MIMEText(
            f"Backup automático de YAAVS.\n\n"
            f"Archivo: {backup_path.name}\n"
            f"Tamaño: {size_kb:.1f} KB\n"
            f"Fecha: {now}\n\n"
            f"Restaurar:\n"
            f"  gunzip -c {backup_path.name} | "
            f"docker exec -i yaavs_postgres psql -U postgres -d yaavs_db\n",
            "plain",
            "utf-8",
        )
    )

    with backup_path.open("rb") as handle:
        attachment = MIMEApplication(handle.read(), Name=backup_path.name)
    attachment["Content-Disposition"] = f'attachment; filename="{backup_path.name}"'
    msg.attach(attachment)

    with smtplib.SMTP(host, port, timeout=60) as smtp:
        smtp.ehlo()
        smtp.starttls()
        smtp.ehlo()
        smtp.login(user, password)
        smtp.send_message(msg)

    print(f"Correo enviado a {to_addr} ({backup_path.name}, {size_kb:.1f} KB)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
