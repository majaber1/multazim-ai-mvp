import json
from pathlib import Path

ROOT = Path(__file__).parents[1]
ALLOWED_STATUSES = {"CONFIRMED_REQUIREMENT", "SUGGESTED_REQUIREMENT", "REQUIRES_EXPERT_VERIFICATION"}


def validate():
    journeys = [path for path in (ROOT / "regulatory_journeys").rglob("*.json") if path.name != "schema.json"]
    codes = set()
    for path in journeys:
        data = json.loads(path.read_text(encoding="utf-8"))
        assert data["code"] not in codes, f"duplicate journey code {data['code']}"
        codes.add(data["code"])
        sources = {source["id"]: source for source in data["official_sources"]}
        assert sources, f"{path}: at least one official source is required"
        assert all(source["url"].startswith("https://") for source in sources.values())
        requirement_codes = set()
        total_weight = 0
        for requirement in data["requirements"]:
            assert requirement["code"] not in requirement_codes, f"{path}: duplicate requirement code"
            requirement_codes.add(requirement["code"])
            assert requirement["status"] in ALLOWED_STATUSES, f"{path}: invalid verification status"
            assert requirement["source_id"] in sources, f"{path}: unknown source {requirement['source_id']}"
            assert 0 < requirement["weight"] <= 100, f"{path}: invalid weight"
            total_weight += requirement["weight"]
        assert total_weight == 100, f"{path}: requirement weights must total 100"
    return len(journeys)


if __name__ == "__main__":
    print(f"Validated {validate()} regulatory journey records")
