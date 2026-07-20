from __future__ import annotations

import argparse
from pathlib import Path

from docx import Document


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("docx", type=Path)
    args = parser.parse_args()

    doc = Document(args.docx)
    changed = 0
    for paragraph in doc.paragraphs:
        text = " ".join(paragraph.text.split())
        if text.startswith("3.2.1."):
            paragraph.style = doc.styles["Heading 2"]
            changed += 1
    doc.save(args.docx)
    print(f"heading_style_changed={changed}")


if __name__ == "__main__":
    main()
