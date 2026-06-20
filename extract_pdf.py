from pypdf import PdfReader

input_path = r"D:\New folder\Desktop\logistic_master\startup_books\The Lean Startup - Erick Ries.pdf"
output_path = r"D:\New folder\Desktop\logistic_master\startup_books\_extracted_lean_startup.txt"

try:
    reader = PdfReader(input_path)
    print(f"Total pages: {len(reader.pages)}")
except Exception as e:
    print(f"ERROR: Could not open PDF: {e}")
    exit(1)

try:
    with open(output_path, "w", encoding="utf-8") as f:
        for i, page in enumerate(reader.pages, start=1):
            text = page.extract_text()
            if text:
                f.write(text + "\n")
            print(f"Page {i:3d} extracted ({len(text) if text else 0} chars)")
    print(f"\nDone. Saved to: {output_path}")
except Exception as e:
    print(f"ERROR: Could not write output: {e}")
    exit(1)
