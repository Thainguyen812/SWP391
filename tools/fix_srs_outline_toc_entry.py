from __future__ import annotations

import argparse
from pathlib import Path

from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn


def set_outline_level_2(paragraph) -> None:
    p_pr = paragraph._p.get_or_add_pPr()

    for child in list(p_pr):
        if child.tag == qn("w:outlineLvl"):
            p_pr.remove(child)
        if child.tag == qn("w:numPr"):
            p_pr.remove(child)

    outline = OxmlElement("w:outlineLvl")
    outline.set(qn("w:val"), "1")
    p_pr.append(outline)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("docx", type=Path)
    args = parser.parse_args()

    doc = Document(args.docx)
    changed = 0
    for paragraph in doc.paragraphs:
        text = " ".join(paragraph.text.split())
        if text.startswith("3.2.1."):
            paragraph.style = doc.styles["Normal"]
            set_outline_level_2(paragraph)
            changed += 1
    doc.save(args.docx)
    print(f"outline_toc_entry_changed={changed}")


if __name__ == "__main__":
    main()
