import json
from pathlib import Path

ROOT = Path(__file__).parents[1]
required = {"code", "regulator", "name_ar", "name_en", "version", "status", "official_source", "controls"}
allowed = {"VERIFIED_METADATA", "CONTENT_PENDING_VERIFICATION"}

def validate():
    files = list((ROOT / "regulatory_catalog").rglob("*.json"))
    catalogs = [path for path in files if path.name != "schema.json"]
    codes = set()
    for path in catalogs:
        data = json.loads(path.read_text(encoding="utf-8"))
        missing = required - data.keys()
        assert not missing, f"{path}: missing {sorted(missing)}"
        assert data["status"] in allowed, f"{path}: invalid status"
        assert data["official_source"].startswith("https://"), f"{path}: official source must use HTTPS"
        assert data["code"] not in codes, f"duplicate code {data['code']}"
        codes.add(data["code"])
    return len(catalogs)

if __name__ == "__main__":
    print(f"Validated {validate()} catalog records")
