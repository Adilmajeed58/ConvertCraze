ConvertCraze
ConvertCraze is a client-side file converter website built with HTML, CSS, and JavaScript. It offers a sleek glassmorphism design, responsive layout, and supports multiple file conversions without requiring API keys. The project features a red logo, progress bars for conversions, and robust error handling.
Features

Conversions:
Image to PDF (JPEG/PNG to high-quality PDF).
PDF to Word (PDF to .docx with Unicode support).
Word to PDF (.doc/.docx to PDF, text-only).
Word to Excel (.doc/.docx to .xlsx, text-only).
PPT to PDF (.ppt/.pptx to PDF, text-only).


Design:
Glassmorphism UI with high-contrast background for readability.
Responsive layout for laptops, tablets, and mobiles.
Red FontAwesome logo with “ConvertCraze” branding.


Functionality:
Progress bars (0–100%) for each conversion.
Client-side processing using free libraries (jsPDF, pdf.js, JSZip, mammoth.js, SheetJS).
Navbar highlighting and smooth scrolling.



Installation

Clone the repository:git clone https://github.com/your-username/convertcraze.git


Open index.html in a modern browser (e.g., Chrome, Firefox).

Usage

Select a conversion type (e.g., PDF to Word).
Upload a file (e.g., .pdf, .docx, .pptx).
Click “Convert” and monitor the progress bar.
Download the converted file.
Check status messages for errors (e.g., invalid file type).

Limitations

Text-only conversions for Word to PDF/Excel and PPT to PDF (no images/layouts).
PDF to Word supports text-based PDFs (scanned PDFs require OCR).
File size limit: 10MB for PDF to Word.
Tested on Chrome/Firefox; older browsers may have issues.

Technologies

HTML/CSS/JavaScript: Core structure, styling, and logic.
Libraries:
jsPDF: PDF generation.
pdf.js: PDF parsing.
JSZip: DOCX/PPTX processing.
FileSaver.js: File downloads.
mammoth.js: Word parsing.
SheetJS: Excel generation.
FontAwesome: Red logo icon.



Contributing

Fork the repository.
Create a branch (git checkout -b feature-name).
Commit changes (git commit -m "Add feature").
Push to the branch (git push origin feature-name).
Open a Pull Request.

License
MIT License (optional; add if you included a license).
Acknowledgments
Built with inspiration from graphic design principles and UX focus, emphasizing free resources and client-side solutions.
