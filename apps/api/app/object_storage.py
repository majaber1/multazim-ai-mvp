from __future__ import annotations

import os
from pathlib import Path


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
    destination = root / key
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(content)
    return str(destination)
