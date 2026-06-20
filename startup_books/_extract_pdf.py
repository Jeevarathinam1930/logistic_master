import pdfplumber

pdf_path = r"D:\New folder\Desktop\logistic_master\startup_books\Measure-What-Matter-John-Doerr.pdf"
out_path = r"D:\New folder\Desktop\logistic_master\startup_books\_extracted_mwm.txt"

with pdfplumber.open(pdf_path) as pdf:
    print(f"Pages: {len(pdf.pages)}")
    with open(out_path, "w", encoding="utf-8") as f:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text:
                f.write(f"--- PAGE {i+1} ---\n")
                f.write(text)
                f.write("\n")
    print("Done writing", out_path)
