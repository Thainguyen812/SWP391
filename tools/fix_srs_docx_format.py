from __future__ import annotations

import argparse
import re
import shutil
import zipfile
from datetime import datetime
from pathlib import Path


ITALIC_TAG_RE = re.compile(
    rb"<w:i(?:\s+[^>]*)?/>|<w:iCs(?:\s+[^>]*)?/>"
)


def ensure_update_fields(settings_xml: bytes) -> bytes:
    if b"<w:updateFields" in settings_xml:
        return re.sub(
            rb'<w:updateFields\b[^>]*/>',
            b'<w:updateFields w:val="true"/>',
            settings_xml,
            count=1,
        )

    close = b"</w:settings>"
    if close not in settings_xml:
        return settings_xml
    return settings_xml.replace(close, b'<w:updateFields w:val="true"/>' + close, 1)


def patch_docx(path: Path) -> tuple[Path, int]:
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup = path.with_name(f"{path.stem}.before_codex_{timestamp}{path.suffix}")
    temp = path.with_name(f"{path.stem}.codex_tmp{path.suffix}")

    shutil.copy2(path, backup)

    removed = 0
    with zipfile.ZipFile(path, "r") as zin, zipfile.ZipFile(temp, "w", zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            data = zin.read(item.filename)
            if item.filename.startswith("word/") and item.filename.endswith(".xml"):
                data, count = ITALIC_TAG_RE.subn(b"", data)
                removed += count
                if item.filename == "word/settings.xml":
                    data = ensure_update_fields(data)
            zout.writestr(item, data)

    shutil.move(str(temp), str(path))
    return backup, removed


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("docx", type=Path)
    args = parser.parse_args()
    backup, removed = patch_docx(args.docx)
    print(f"backup={backup}")
    print(f"italic_tags_removed={removed}")


if __name__ == "__main__":
    main()
