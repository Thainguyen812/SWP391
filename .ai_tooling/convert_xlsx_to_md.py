import sys
import pandas as pd
from pathlib import Path

inp = sys.argv[1]
out = sys.argv[2]
wb = pd.read_excel(inp, sheet_name=None)
parts = []
for sheet_name, df in wb.items():
    parts.append(f"# {sheet_name}\n")
    if df.empty:
        parts.append("_(empty sheet)_\n")
    else:
        try:
            md = df.to_markdown(index=False)
        except Exception:
            md = df.to_string(index=False)
        parts.append(md + "\n")
text = "\n".join(parts)
Path(out).write_text(text, encoding="utf-8")
