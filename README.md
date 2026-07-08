# FileForge

FileForge v1.0.0 is a polished browser-based image and PDF utility. It lets you resize, convert, merge, split, and export files directly in the browser with no backend upload step.

Tagline: Resize, convert, and manage image and PDF files right in your browser.

## Features

- Modern responsive interface with light and dark mode
- Local file processing in the browser
- Drag-and-drop upload zones
- Loading indicators during processing
- Friendly success and error messages
- Clear/reset buttons for Image Tools and PDF Tools
- Download feedback after processed files are downloaded
- Disabled button states until each action is ready
- Logo, favicon, version number, About, FAQ, Privacy, and footer sections

## Image Tools

- Upload JPG, PNG, or WebP images
- Preview the uploaded image
- Show file name, format, dimensions, and file size
- Resize by width and height
- Maintain aspect ratio while resizing
- Convert output to JPG, PNG, or WebP
- Adjust JPG/WebP quality
- Compress image output
- Show processed output size
- Download the processed image

## PDF Tools

- Upload one or more PDF files
- Show PDF file name, total file size, version, and page count
- Merge multiple PDFs into one file
- Split the first uploaded PDF by page range, such as `1-3, 5`
- Convert JPG, PNG, or WebP images to PDF
- Show processed PDF output size
- Download the processed PDF

## Tech Stack

- HTML
- CSS
- JavaScript
- Browser Canvas API for image resizing and conversion
- `pdf-lib` browser build for PDF merge, split, page counts, and image-to-PDF export

The PDF library is vendored locally at:

```text
assets/pdf-lib.min.js
```

## Setup

Open `index.html` directly in a modern browser, or serve the project locally:

```bash
python3 -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## Project Files

```text
index.html
styles.css
script.js
README.md
assets/
```

## Privacy

FileForge processes files locally in the browser. Images and PDFs are not uploaded to a server. The app can run as a static website because all processing happens client-side.

## Browser Support

Use a current version of Chrome, Edge, Firefox, or Safari. Image export depends on `canvas.toBlob()`, and PDF features depend on the included browser build of `pdf-lib`.

## Known Notes

- JPG output fills transparent pixels with white because JPG does not support transparency.
- PNG output does not use the quality slider in the same way JPG and WebP do.
- PDF splitting currently uses the first uploaded PDF.
- PDF compression and PDF-to-image rendering are not included yet.

## Future Improvements

- Batch image processing
- Custom output file names
- Side-by-side before and after image preview
- PDF compression
- PDF-to-image rendering
- Choose which uploaded PDF to split
- Reorder PDFs before merging
- Optional local-only file history

## Credits

Built by Srijayanth Saseendran © 2026
