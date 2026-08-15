from pathlib import Path
import sys

from fastapi.testclient import TestClient

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "apps" / "api"))
from app.main import DEMO_ORGANIZATION_ID, app  # noqa: E402


def main() -> None:
    output = ROOT / "output" / "pdf"
    output.mkdir(parents=True, exist_ok=True)
    client = TestClient(app)
    headers = {"X-User-Id": "pdf-qa", "X-Organization-Id": str(DEMO_ORGANIZATION_ID), "X-Role": "organization_admin"}
    for locale in ("ar", "en"):
        response = client.get("/v1/reports/executive.pdf", params={"locale": locale}, headers=headers)
        response.raise_for_status()
        path = output / f"multazim-executive-report-{locale}.pdf"
        path.write_bytes(response.content)
        print(path)


if __name__ == "__main__":
    main()
