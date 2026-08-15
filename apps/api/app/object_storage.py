from __future__ import annotations

import os
from pathlib import Path


MAGIC_TYPES = {
    "application/pdf": lambda value: value.startswith(b"%PDF-"),
    "image/png": lambda value: value.startswith(b"\x89PNG\r\n\x1a\n"),
    "image/jpeg": lambda value: value.startswith(b"\xff\xd8\xff"),
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": lambda value: value.startswith(b"PK\x03\x04"),
    "text/csv": lambda value: b"\x00" not in value[:4096],
}


def validate_content_type(content: bytes, declared_type: str) -> bool:
    validator = MAGIC_TYPES.get(declared_type)
    return bool(validator and validator(content))


def scan_upload(content: bytes) -> tuple[bool, str]:
    """Zero-dependency safety gate; ClamAV can be added in front for deep scanning."""
    if b"EICAR-STANDARD-ANTIVIRUS-TEST-FILE" in content:
        return False, "eicar_test_signature"
    if content.startswith((b"MZ", b"\x7fELF")):
        return False, "executable_content_rejected"
    return True, "basic_signature_clean"


def put_object(key: str, content: bytes) -> str:
    """Local durable storage by default; S3-compatible deployments use the same key contract."""
    default_root = "/tmp/evidence" if os.getenv("VERCEL") else ".data/evidence"
    root = Path(os.getenv("UPLOAD_DIR", default_root))
    root = root.resolve()
    destination = (root / key).resolve()
    if root not in destination.parents:
        raise ValueError("Object key escapes the configured storage root")
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(content)
    return str(destination)
