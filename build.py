"""Package the Zotero extension. Run with python build.py."""

import hashlib
import json
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


root = Path(__file__).resolve().parent
addon = root / "addon"
manifest = json.loads((addon / "manifest.json").read_text(encoding="utf-8"))
version = manifest["version"]
application = manifest["applications"]["zotero"]
output = root / "dist" / f"llm-paper-chat-{version}.xpi"
output.parent.mkdir(exist_ok=True)

with ZipFile(output, "w", ZIP_DEFLATED) as xpi:
    for source in sorted(addon.rglob("*")):
        if source.is_file():
            xpi.write(source, source.relative_to(addon).as_posix())

release_url = application["update_url"].split("/releases/", 1)[0] + f"/releases/download/v{version}"
updates = {
    "addons": {
        application["id"]: {
            "updates": [
                {
                    "version": version,
                    "update_link": f"{release_url}/{output.name}",
                    "update_hash": "sha256:" + hashlib.sha256(output.read_bytes()).hexdigest(),
                    "applications": {
                        "zotero": {
                            "strict_min_version": application["strict_min_version"],
                            "strict_max_version": application["strict_max_version"],
                        }
                    },
                }
            ]
        }
    }
}
output.with_name("updates.json").write_text(json.dumps(updates, indent=2) + "\n", encoding="utf-8")

print(output)
