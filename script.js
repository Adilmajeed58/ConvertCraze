console.log("Script loaded");

// Navbar Highlighting
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        console.log("Nav link clicked:", link.getAttribute('data-section'));
        const sectionId = link.getAttribute('data-section');
        const section = document.querySelector(`section[data-section="${sectionId}"]`);
        
        // Remove highlight from all sections
        document.querySelectorAll('.converter-card').forEach(card => {
            card.classList.remove('highlight');
        });
        
        // Add highlight to target section
        section.classList.add('highlight');
        
        // Smooth scroll to section
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

async function convertImageToPDF() {
    console.log("convertImageToPDF called");
    const input = document.getElementById('imageInput');
    const status = document.getElementById('imageStatus');
    const progressBar = document.getElementById('imageProgress');
    const downloadLink = document.getElementById('downloadImageToPDF');
    const files = input.files;

    if (!files.length) {
        status.textContent = 'Please select at least one image.';
        console.log("No files selected");
        return;
    }

    status.textContent = 'Converting...';
    progressBar.style.width = '0%';
    progressBar.textContent = '0%';
    downloadLink.style.display = 'none';
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'px', format: 'a4', compress: false });

    try {
        const totalFiles = files.length;
        let processedFiles = 0;

        for (const file of files) {
            console.log("Processing image:", file.name);
            if (!file.type.startsWith('image/')) {
                throw new Error('Invalid file type. Please select an image.');
            }
            const imgData = await readFileAsDataURL(file);
            const img = new Image();
            img.src = imgData;
            await new Promise((resolve) => { img.onload = resolve; });

            const imgWidth = img.width;
            const imgHeight = img.height;
            const pdfWidth = doc.internal.pageSize.getWidth() - 20;
            const pdfHeight = (imgHeight * pdfWidth) / imgWidth;

            if (doc.internal.getNumberOfPages() > 1) {
                doc.addPage();
            }
            doc.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight, undefined, 'NONE');

            processedFiles++;
            const progress = Math.round((processedFiles / totalFiles) * 100);
            progressBar.style.width = `${progress}%`;
            progressBar.textContent = `${progress}%`;
        }

        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = 'converted.pdf';
        downloadLink.style.display = 'inline-block';
        status.textContent = 'Conversion complete!';
        console.log("Image to PDF conversion complete");
        setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error) {
        status.textContent = 'Error: ' + error.message;
        progressBar.style.width = '0%';
        progressBar.textContent = '0%';
        console.error("Image to PDF error:", error);
    }
}

async function convertPDFToWord() {
    console.log("convertPDFToWord called");
    const input = document.getElementById('pdfToWordInput');
    const status = document.getElementById('pdfToWordStatus');
    const progressBar = document.getElementById('pdfToWordProgress');
    const downloadLink = document.getElementById('downloadPDFToWord');

    if (!input.files.length) {
        status.textContent = 'Please select a PDF file.';
        console.log("No PDF selected");
        return;
    }

    status.textContent = 'Converting...';
    progressBar.style.width = '0%';
    progressBar.textContent = '0%';
    downloadLink.style.display = 'none';
    const file = input.files[0];

    if (!file.type.includes('pdf')) {
        status.textContent = 'Error: Please select a valid PDF file.';
        console.log("Invalid file type:", file.type);
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        status.textContent = 'Error: File size exceeds 10MB limit.';
        console.log("File too large:", file.size);
        return;
    }

    try {
        console.log("Processing PDF:", file.name);
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        const totalPages = pdf.numPages;

        for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map(item => item.str).join(' ') + '\n';
            const progress = Math.round((pageNum / totalPages) * 80); // Up to 80% for text extraction
            progressBar.style.width = `${progress}%`;
            progressBar.textContent = `${progress}%`;
        }

        // Sanitize text to remove invalid XML characters
        fullText = fullText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

        progressBar.style.width = '90%';
        progressBar.textContent = '90%'; // Generating DOCX

        // Create a complete DOCX structure
        const zip = new JSZip();
        zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="xml" ContentType="application/xml"/>
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
    <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
    <Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>
</Types>`);
        zip.file('_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
    <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="word/styles.xml"/>
    <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="word/settings.xml"/>
</Relationships>`);
        zip.file('word/document.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:body>
        ${fullText.split('\n').map(line => `
        <w:p>
            <w:r>
                <w:t xml:space="preserve">${line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</w:t>
            </w:r>
        </w:p>`).join('')}
        <w:sectPr>
            <w:pgSz w:w="12240" w:h="15840"/>
            <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
            <w:cols w:space="720"/>
        </w:sectPr>
    </w:body>
</w:document>`);
        zip.file('word/styles.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
        <w:name w:val="Normal"/>
        <w:qFormat/>
        <w:rPr>
            <w:sz w:val="24"/>
            <w:szCs w:val="24"/>
        </w:rPr>
    </w:style>
</w:styles>`);
        zip.file('word/settings.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:zoom w:percent="100"/>
    <w:proofState w:spelling="clean" w:grammar="clean"/>
    <w:defaultTabStop w:val="720"/>
</w:settings>`);

        const blob = await zip.generateAsync({
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            compression: 'DEFLATE'
        });
        progressBar.style.width = '100%';
        progressBar.textContent = '100%'; // Complete
        const url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = 'converted.docx';
        downloadLink.style.display = 'inline-block';
        status.textContent = 'Conversion complete! Saved as .docx with Unicode support.';
        console.log("PDF to Word conversion complete");
        setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error) {
        status.textContent = 'Error: ' + error.message;
        progressBar.style.width = '0%';
        progressBar.textContent = '0%';
        console.error("PDF to Word error:", error);
    }
}

async function convertWordToPDF() {
    console.log("convertWordToPDF called");
    const input = document.getElementById('wordToPDFInput');
    const status = document.getElementById('wordToPDFStatus');
    const progressBar = document.getElementById('wordToPDFProgress');
    const downloadLink = document.getElementById('downloadWordToPDF');

    if (!input.files.length) {
        status.textContent = 'Please select a Word file.';
        console.log("No Word file selected");
        return;
    }

    status.textContent = 'Converting...';
    progressBar.style.width = '0%';
    progressBar.textContent = '0%';
    downloadLink.style.display = 'none';
    const file = input.files[0];

    if (!file.name.match(/\.(doc|docx)$/i)) {
        status.textContent = 'Error: Please select a valid .doc or .docx file.';
        console.log("Invalid file type:", file.name);
        return;
    }

    try {
        console.log("Processing Word:", file.name);
        progressBar.style.width = '30%';
        progressBar.textContent = '30%'; // Parsing
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value;

        progressBar.style.width = '60%';
        progressBar.textContent = '60%'; // Rendering
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const lines = doc.splitTextToSize(text, doc.internal.pageSize.getWidth() - 20);
        doc.text(lines, 10, 10);

        progressBar.style.width = '100%';
        progressBar.textContent = '100%'; // Complete
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = 'converted.pdf';
        downloadLink.style.display = 'inline-block';
        status.textContent = 'Conversion complete!';
        console.log("Word to PDF conversion complete");
        setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error) {
        status.textContent = 'Error: ' + error.message;
        progressBar.style.width = '0%';
        progressBar.textContent = '0%';
        console.error("Word to PDF error:", error);
    }
}

async function convertWordToExcel() {
    console.log("convertWordToExcel called");
    const input = document.getElementById('wordToExcelInput');
    const status = document.getElementById('wordToExcelStatus');
    const progressBar = document.getElementById('wordToExcelProgress');
    const downloadLink = document.getElementById('downloadWordToExcel');

    if (!input.files.length) {
        status.textContent = 'Please select a Word file.';
        console.log("No Word file selected");
        return;
    }

    status.textContent = 'Converting...';
    progressBar.style.width = '0%';
    progressBar.textContent = '0%';
    downloadLink.style.display = 'none';
    const file = input.files[0];

    if (!file.name.match(/\.(doc|docx)$/i)) {
        status.textContent = 'Error: Please select a valid .doc or .docx file.';
        console.log("Invalid file type:", file.name);
        return;
    }

    try {
        console.log("Processing Word:", file.name);
        progressBar.style.width = '30%';
        progressBar.textContent = '30%'; // Parsing
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value;

        progressBar.style.width = '60%';
        progressBar.textContent = '60%'; // Generating
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet([{ Content: text.split('\n').join(' ') }]);
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

        progressBar.style.width = '100%';
        progressBar.textContent = '100%'; // Complete
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = 'converted.xlsx';
        downloadLink.style.display = 'inline-block';
        status.textContent = 'Conversion complete!';
        console.log("Word to Excel conversion complete");
        setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error) {
        status.textContent = 'Error: ' + error.message;
        progressBar.style.width = '0%';
        progressBar.textContent = '0%';
        console.error("Word to Excel error:", error);
    }
}

async function convertPPTToPDF() {
    console.log("convertPPTToPDF called");
    const input = document.getElementById('pptToPDFInput');
    const status = document.getElementById('pptToPDFStatus');
    const progressBar = document.getElementById('pptToPDFProgress');
    const downloadLink = document.getElementById('downloadPPTToPDF');

    if (!input.files.length) {
        status.textContent = 'Please select a PPT file.';
        console.log("No PPT file selected");
        return;
    }

    status.textContent = 'Converting...';
    progressBar.style.width = '0%';
    progressBar.textContent = '0%';
    downloadLink.style.display = 'none';
    const file = input.files[0];

    if (!file.name.match(/\.(ppt|pptx)$/i)) {
        status.textContent = 'Error: Please select a valid .ppt or .pptx file.';
        console.log("Invalid file type:", file.name);
        return;
    }

    try {
        console.log("Processing PPT:", file.name);
        progressBar.style.width = '30%';
        progressBar.textContent = '30%'; // Loading
        const arrayBuffer = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);
        let fullText = '';

        // Extract text from slide XML files
        const slideFiles = Object.keys(zip.files).filter(f => f.match(/^ppt\/slides\/slide\d+\.xml$/)).sort();
        const totalSlides = slideFiles.length;

        for (let i = 0; i < totalSlides; i++) {
            const slideFile = slideFiles[i];
            const xml = await zip.file(slideFile).async('string');
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xml, 'application/xml');
            const textNodes = xmlDoc.getElementsByTagName('a:t');
            for (const node of textNodes) {
                fullText += (node.textContent || '') + ' ';
            }
            fullText += '\n';
            const progress = Math.round(30 + ((i + 1) / totalSlides) * 50); // 30% to 80%
            progressBar.style.width = `${progress}%`;
            progressBar.textContent = `${progress}%`;
        }

        if (!fullText.trim()) {
            fullText = 'No text found in PPT. Images and complex layouts are not supported.';
        }

        progressBar.style.width = '90%';
        progressBar.textContent = '90%'; // Rendering
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const lines = doc.splitTextToSize(fullText, doc.internal.pageSize.getWidth() - 20);
        doc.text(lines, 10, 10);

        progressBar.style.width = '100%';
        progressBar.textContent = '100%'; // Complete
        const blob = doc.output('blob');
        const url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = 'converted.pdf';
        downloadLink.style.display = 'inline-block';
        status.textContent = 'Conversion complete! Basic text extracted.';
        console.log("PPT to PDF conversion complete");
        setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (error) {
        status.textContent = 'Error: ' + error.message;
        progressBar.style.width = '0%';
        progressBar.textContent = '0%';
        console.error("PPT to PDF error:", error);
    }
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}