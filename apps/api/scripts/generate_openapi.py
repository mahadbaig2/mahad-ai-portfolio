"""Script to export OpenAPI 3.1 schema to packages/contracts/openapi.json."""

import json
import sys
from pathlib import Path

# Ensure repository root is in sys.path
REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from apps.api.main import create_app  # noqa: E402


def generate_openapi() -> Path:
    """Export the OpenAPI schema to packages/contracts/openapi.json."""
    app = create_app()
    openapi_schema = app.openapi()

    output_path = REPO_ROOT / "packages" / "contracts" / "openapi.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(openapi_schema, f, indent=2)
        f.write("\n")

    print(f"Successfully generated OpenAPI schema at: {output_path}")
    return output_path


if __name__ == "__main__":
    generate_openapi()
