const tabs = document.querySelectorAll(".tab-button");
const panels = document.querySelectorAll(".tool-panel");
const themeToggle = document.querySelector("#theme-toggle");
const themeIcon = document.querySelector("#theme-icon");
const themeLabel = document.querySelector("#theme-label");

const imageInput = document.querySelector("#image-input");
const imageDropZone = document.querySelector("#image-drop-zone");
const imageMessage = document.querySelector("#image-message");
const imageProcessing = document.querySelector("#image-processing");
const imagePreview = document.querySelector("#image-preview");
const imagePreviewFrame = imagePreview.closest(".preview-frame");
const imageName = document.querySelector("#image-name");
const imageFormat = document.querySelector("#image-format");
const imageDimensions = document.querySelector("#image-dimensions");
const imageSize = document.querySelector("#image-size");
const imageOutputSize = document.querySelector("#image-output-size");
const resizeWidth = document.querySelector("#resize-width");
const resizeHeight = document.querySelector("#resize-height");
const keepRatio = document.querySelector("#keep-ratio");
const outputFormat = document.querySelector("#output-format");
const qualitySlider = document.querySelector("#quality-slider");
const qualityValue = document.querySelector("#quality-value");
const compressImage = document.querySelector("#compress-image");
const processImageButton = document.querySelector("#process-image");
const downloadImageLink = document.querySelector("#download-image");
const clearImageButton = document.querySelector("#clear-image");

const pdfInput = document.querySelector("#pdf-input");
const pdfDropZone = document.querySelector("#pdf-drop-zone");
const pdfMessage = document.querySelector("#pdf-message");
const pdfProcessing = document.querySelector("#pdf-processing");
const pdfName = document.querySelector("#pdf-name");
const pdfSize = document.querySelector("#pdf-size");
const pdfOutputSize = document.querySelector("#pdf-output-size");
const pdfVersion = document.querySelector("#pdf-version");
const pdfPages = document.querySelector("#pdf-pages");
const pdfStatus = document.querySelector("#pdf-status");
const splitRange = document.querySelector("#split-range");
const pdfImageInput = document.querySelector("#pdf-image-input");
const pdfImageDropZone = document.querySelector("#pdf-image-drop-zone");
const mergePdfButton = document.querySelector("#merge-pdf");
const splitPdfButton = document.querySelector("#split-pdf");
const imageToPdfButton = document.querySelector("#image-to-pdf");
const downloadPdfLink = document.querySelector("#download-pdf");
const clearPdfButton = document.querySelector("#clear-pdf");

let currentImage = null;
let originalImageWidth = 0;
let originalImageHeight = 0;
let originalImageSize = 0;
let processedImageUrl = "";
let currentPdfFiles = [];
let currentPdfDocs = [];
let currentPdfPageCounts = [];
let currentPdfOutputUrl = "";
let currentPdfImageFile = null;
let isImageProcessing = false;
let isPdfProcessing = false;

function readSavedTheme() {
  try {
    return localStorage.getItem("fileforge-theme");
  } catch (error) {
    return null;
  }
}

function saveTheme(theme) {
  try {
    localStorage.setItem("fileforge-theme", theme);
  } catch (error) {
    // Theme persistence is optional; the app should still work if storage is blocked.
  }
}

function resetImageEmptyState() {
  currentImage = null;
  originalImageWidth = 0;
  originalImageHeight = 0;
  originalImageSize = 0;
  resetDownload();
  imagePreview.removeAttribute("src");
  imagePreviewFrame.classList.remove("has-image");
  imageName.textContent = "No image selected";
  imageFormat.textContent = "Waiting for upload";
  imageDimensions.textContent = "Upload an image to inspect it";
  imageSize.textContent = "Not available yet";
  imageOutputSize.textContent = "Process an image to see output size";
  resizeWidth.value = "";
  resizeHeight.value = "";
  imageInput.value = "";
  setImageControlsEnabled(false);
  setImageProcessing(false);
  clearMessage(imageMessage);
}

function resetPdfEmptyState() {
  currentPdfFiles = [];
  currentPdfDocs = [];
  currentPdfPageCounts = [];
  resetPdfDownload();
  pdfName.textContent = "No PDF selected";
  pdfSize.textContent = "Not available yet";
  pdfOutputSize.textContent = "Process a PDF to see output size";
  pdfVersion.textContent = "Waiting for upload";
  pdfPages.textContent = "Upload a PDF to count pages";
  pdfStatus.textContent = "Ready when you are";
  splitRange.value = "";
  pdfInput.value = "";
  setPdfControlsEnabled(false);
  setPdfProcessing(false);
  clearMessage(pdfMessage);
}

function applyTheme(theme) {
  const isDark = theme === "dark";

  document.body.classList.toggle("dark-theme", isDark);
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeIcon.textContent = isDark ? "L" : "D";
  themeLabel.textContent = isDark ? "Light mode" : "Dark mode";
  saveTheme(theme);
}

const savedTheme = readSavedTheme();
const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
const preferredTheme = prefersDark ? "dark" : "light";
applyTheme(savedTheme || preferredTheme);

themeToggle.addEventListener("click", () => {
  const nextTheme = document.body.classList.contains("dark-theme") ? "light" : "dark";
  applyTheme(nextTheme);
});

// Tab navigation keeps both tools on one page without reloading the app.
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const targetPanelId = tab.dataset.tab;

    tabs.forEach((item) => {
      item.classList.toggle("active", item === tab);
      item.setAttribute("aria-selected", item === tab);
    });

    panels.forEach((panel) => {
      panel.classList.toggle("active", panel.id === targetPanelId);
    });
  });
});

// Reusable drag-and-drop setup for image and PDF upload areas.
function setupDropZone(dropZone, input, onFileSelected) {
  dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropZone.classList.add("drag-over");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("drag-over");
  });

  dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropZone.classList.remove("drag-over");

    const files = Array.from(event.dataTransfer.files);
    if (files.length) {
      onFileSelected(input.multiple ? files : files[0]);
    }
  });

  input.addEventListener("change", () => {
    const files = Array.from(input.files);
    if (files.length) {
      onFileSelected(input.multiple ? files : files[0]);
    }
  });
}

function showMessage(element, text, type) {
  element.textContent = text;
  element.className = `message visible ${type}`;
}

function clearMessage(element) {
  element.textContent = "";
  element.className = "message";
}

function formatBytes(bytes) {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const units = ["Bytes", "KB", "MB", "GB"];
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, unitIndex);

  return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[unitIndex]}`;
}

function fileExtensionFromMime(mimeType) {
  const extensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp"
  };

  return extensions[mimeType] || "file";
}

function resetDownload() {
  if (processedImageUrl) {
    URL.revokeObjectURL(processedImageUrl);
  }

  processedImageUrl = "";
  downloadImageLink.href = "#";
  downloadImageLink.removeAttribute("download");
  downloadImageLink.setAttribute("aria-disabled", "true");
  downloadImageLink.classList.add("disabled");
}

function setImageControlsEnabled(isEnabled) {
  processImageButton.disabled = !isEnabled || isImageProcessing;
  clearImageButton.disabled = !currentImage && !processedImageUrl;
}

function setPdfControlsEnabled(isEnabled) {
  mergePdfButton.disabled = isPdfProcessing || !isEnabled || currentPdfDocs.length < 2;
  splitPdfButton.disabled = isPdfProcessing || !isEnabled || currentPdfDocs.length < 1;
  clearPdfButton.disabled = isPdfProcessing || (!currentPdfFiles.length && !currentPdfImageFile && !currentPdfOutputUrl);
}

function setImageToPdfEnabled(isEnabled) {
  imageToPdfButton.disabled = isPdfProcessing || !isEnabled;
  clearPdfButton.disabled = isPdfProcessing || (!currentPdfFiles.length && !currentPdfImageFile && !currentPdfOutputUrl);
}

function setImageProcessing(isProcessing) {
  isImageProcessing = isProcessing;
  imageProcessing.hidden = !isProcessing;
  setImageControlsEnabled(Boolean(currentImage));
}

function setPdfProcessing(isProcessing) {
  isPdfProcessing = isProcessing;
  pdfProcessing.hidden = !isProcessing;
  setPdfControlsEnabled(Boolean(currentPdfDocs.length));
  setImageToPdfEnabled(Boolean(currentPdfImageFile));
}

function resetPdfDownload() {
  if (currentPdfOutputUrl) {
    URL.revokeObjectURL(currentPdfOutputUrl);
  }

  currentPdfOutputUrl = "";
  pdfOutputSize.textContent = "No PDF output yet";
  downloadPdfLink.href = "#";
  downloadPdfLink.removeAttribute("download");
  downloadPdfLink.setAttribute("aria-disabled", "true");
  downloadPdfLink.classList.add("disabled");
}

function enablePdfDownload(bytes, fileName, message) {
  resetPdfDownload();

  const blob = new Blob([bytes], { type: "application/pdf" });
  currentPdfOutputUrl = URL.createObjectURL(blob);
  pdfOutputSize.textContent = formatBytes(blob.size);
  downloadPdfLink.href = currentPdfOutputUrl;
  downloadPdfLink.download = fileName;
  downloadPdfLink.setAttribute("aria-disabled", "false");
  downloadPdfLink.classList.remove("disabled");
  showMessage(pdfMessage, `${message} Output size: ${formatBytes(blob.size)}.`, "success");
}

function clearImageTool() {
  resetImageEmptyState();
  showMessage(imageMessage, "Image workspace cleared. Add a new image whenever you are ready.", "success");
}

function clearPdfTool() {
  currentPdfImageFile = null;
  pdfImageInput.value = "";
  resetPdfEmptyState();
  setImageToPdfEnabled(false);
  showMessage(pdfMessage, "PDF workspace cleared. Add PDFs or an image to start again.", "success");
}

function getPdfLib() {
  const pdfLib = globalThis.PDFLib || (typeof PDFLib !== "undefined" ? PDFLib : null);

  if (!pdfLib) {
    throw new Error("The PDF tools did not load yet. Refresh the page and try again.");
  }

  return pdfLib;
}

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.readAsArrayBuffer(file);
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.readAsDataURL(file);
  });
}

function loadImageFromDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("The image could not be loaded."));
    image.src = dataUrl;
  });
}

function canvasToPngBytes(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Could not convert image for PDF output."));
        return;
      }

      blob.arrayBuffer().then((buffer) => resolve(new Uint8Array(buffer))).catch(reject);
    }, "image/png");
  });
}

function markImageOutputStale() {
  if (!currentImage) {
    return;
  }

  resetDownload();
  imageOutputSize.textContent = "Settings changed. Process again to update output size";
}

function loadImageFile(file) {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  resetDownload();
  imageOutputSize.textContent = "No image output yet";

  if (!allowedTypes.includes(file.type)) {
    resetImageEmptyState();
    showMessage(imageMessage, "That file is not an image FileForge can process. Please choose a JPG, PNG, or WebP file.", "error");
    return;
  }

  showMessage(imageMessage, "Loading image preview...", "info");

  const reader = new FileReader();

  reader.onload = () => {
    const image = new Image();

    image.onload = () => {
      currentImage = image;
      originalImageWidth = image.naturalWidth;
      originalImageHeight = image.naturalHeight;
      originalImageSize = file.size;

      imagePreview.src = reader.result;
      imagePreviewFrame.classList.add("has-image");
      imageName.textContent = file.name;
      imageFormat.textContent = file.type.replace("image/", "").toUpperCase();
      imageDimensions.textContent = `${originalImageWidth} x ${originalImageHeight}px`;
      imageSize.textContent = formatBytes(file.size);
      imageOutputSize.textContent = "No image output yet";
      resizeWidth.value = originalImageWidth;
      resizeHeight.value = originalImageHeight;
      setImageControlsEnabled(true);
      clearImageButton.disabled = false;

      showMessage(imageMessage, "Image loaded. Adjust settings and process when ready.", "success");
    };

    image.onerror = () => {
      resetImageEmptyState();
      showMessage(imageMessage, "FileForge could not preview that image. Try a different JPG, PNG, or WebP file.", "error");
    };

    image.src = reader.result;
  };

  reader.onerror = () => {
    resetImageEmptyState();
    showMessage(imageMessage, "FileForge could not read that image. Please try selecting it again.", "error");
  };

  reader.readAsDataURL(file);
}

function updateHeightFromWidth() {
  if (!keepRatio.checked || !originalImageWidth || !originalImageHeight) {
    return;
  }

  const width = Number(resizeWidth.value);
  if (width > 0) {
    resizeHeight.value = Math.round(width * (originalImageHeight / originalImageWidth));
  }
}

function updateWidthFromHeight() {
  if (!keepRatio.checked || !originalImageWidth || !originalImageHeight) {
    return;
  }

  const height = Number(resizeHeight.value);
  if (height > 0) {
    resizeWidth.value = Math.round(height * (originalImageWidth / originalImageHeight));
  }
}

function getImageQuality() {
  const sliderValue = Number(qualitySlider.value) / 100;

  if (compressImage.checked) {
    return Math.min(sliderValue, 0.82);
  }

  return sliderValue;
}

function processImage() {
  if (!currentImage) {
    showMessage(imageMessage, "Choose an image first, then FileForge can resize or convert it.", "error");
    return;
  }

  const targetWidth = Number(resizeWidth.value);
  const targetHeight = Number(resizeHeight.value);

  if (!targetWidth || !targetHeight || targetWidth < 1 || targetHeight < 1) {
    showMessage(imageMessage, "Enter a width and height greater than zero before processing.", "error");
    return;
  }

  showMessage(imageMessage, "Processing image...", "info");
  setImageProcessing(true);
  resetDownload();

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  if (outputFormat.value === "image/jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  context.drawImage(currentImage, 0, 0, targetWidth, targetHeight);

  const quality = outputFormat.value === "image/png" ? undefined : getImageQuality();

  canvas.toBlob((blob) => {
    setImageProcessing(false);

    if (!blob) {
      showMessage(imageMessage, "Your browser could not create the processed image. Try a smaller image or a different format.", "error");
      return;
    }

    const extension = fileExtensionFromMime(outputFormat.value);
    processedImageUrl = URL.createObjectURL(blob);

    downloadImageLink.href = processedImageUrl;
    downloadImageLink.download = `fileforge-image.${extension}`;
    downloadImageLink.setAttribute("aria-disabled", "false");
    downloadImageLink.classList.remove("disabled");
    imageOutputSize.textContent = formatBytes(blob.size);

    const difference = originalImageSize ? originalImageSize - blob.size : 0;
    const savedText = difference > 0 ? ` Saved ${formatBytes(difference)}.` : "";
    showMessage(imageMessage, `Success! ${formatBytes(originalImageSize)} before, ${formatBytes(blob.size)} after.${savedText}`, "success");
  }, outputFormat.value, quality);
}

async function loadPdfFiles(files) {
  const pdfFiles = Array.isArray(files) ? files : [files];
  const invalidFile = pdfFiles.find((file) => file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf"));

  resetPdfDownload();

  if (invalidFile) {
    resetPdfEmptyState();
    showMessage(pdfMessage, "That file is not a PDF. Please choose one or more PDF files.", "error");
    return;
  }

  showMessage(pdfMessage, "Reading PDF information...", "info");

  try {
    const { PDFDocument } = getPdfLib();
    const loadedPdfs = await Promise.all(pdfFiles.map(async (file) => {
      const bytes = await readFileAsArrayBuffer(file);
      const doc = await PDFDocument.load(bytes);
      const text = new TextDecoder("latin1").decode(new Uint8Array(bytes).slice(0, 1024));
      const versionMatch = text.match(/%PDF-(\d\.\d)/);

      return {
        file,
        doc,
        pageCount: doc.getPageCount(),
        version: versionMatch ? `PDF ${versionMatch[1]}` : "Unknown"
      };
    }));

    currentPdfFiles = loadedPdfs.map((item) => item.file);
    currentPdfDocs = loadedPdfs.map((item) => item.doc);
    currentPdfPageCounts = loadedPdfs.map((item) => item.pageCount);
    splitRange.value = "";

    const totalPages = currentPdfPageCounts.reduce((sum, count) => sum + count, 0);
    const totalSize = currentPdfFiles.reduce((sum, file) => sum + file.size, 0);

    pdfName.textContent = currentPdfFiles.length === 1 ? currentPdfFiles[0].name : `${currentPdfFiles.length} PDFs selected`;
    pdfSize.textContent = formatBytes(totalSize);
    pdfOutputSize.textContent = "No PDF output yet";
    pdfVersion.textContent = currentPdfFiles.length === 1 ? loadedPdfs[0].version : "Multiple files";
    pdfPages.textContent = currentPdfFiles.length === 1 ? String(totalPages) : `${totalPages} total`;
    pdfStatus.textContent = "Loaded with pdf-lib";
    setPdfControlsEnabled(true);
    clearPdfButton.disabled = false;

    const mergeHint = currentPdfFiles.length > 1 ? " Merge is ready." : " Add another PDF to enable merge.";
    showMessage(pdfMessage, `Loaded ${currentPdfFiles.length} PDF file(s) with ${totalPages} page(s).${mergeHint}`, "success");
  } catch (error) {
    resetPdfEmptyState();
    showMessage(pdfMessage, error.message || "FileForge could not read that PDF. It may be encrypted, damaged, or unsupported.", "error");
  }
}

function parsePageRange(rangeText, maxPages) {
  const pages = new Set();
  const chunks = rangeText.split(",").map((part) => part.trim()).filter(Boolean);

  if (!chunks.length) {
    throw new Error("Tell FileForge which pages to keep, such as 1-3 or 2,4.");
  }

  chunks.forEach((chunk) => {
    const rangeMatch = chunk.match(/^(\d+)\s*-\s*(\d+)$/);
    const singleMatch = chunk.match(/^\d+$/);

    if (rangeMatch) {
      const start = Number(rangeMatch[1]);
      const end = Number(rangeMatch[2]);

      if (start > end) {
        throw new Error("Page ranges need to go from low to high, like 2-5.");
      }

      for (let page = start; page <= end; page += 1) {
        pages.add(page);
      }
    } else if (singleMatch) {
      pages.add(Number(chunk));
    } else {
      throw new Error("Use page numbers and ranges only, such as 1-3, 5.");
    }
  });

  const sortedPages = Array.from(pages).sort((a, b) => a - b);
  const outOfRange = sortedPages.find((page) => page < 1 || page > maxPages);

  if (outOfRange) {
    throw new Error(`Page ${outOfRange} is outside this PDF's 1-${maxPages} page range.`);
  }

  return sortedPages.map((page) => page - 1);
}

async function mergePdfs() {
  if (currentPdfDocs.length < 2) {
    showMessage(pdfMessage, "Upload at least two PDFs and FileForge can merge them into one file.", "error");
    return;
  }

  showMessage(pdfMessage, "Merging PDFs...", "info");
  setPdfProcessing(true);

  try {
    const { PDFDocument } = getPdfLib();
    const mergedPdf = await PDFDocument.create();

    for (const sourcePdf of currentPdfDocs) {
      const copiedPages = await mergedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }

    const bytes = await mergedPdf.save();
    enablePdfDownload(bytes, "fileforge-merged.pdf", "PDFs merged successfully.");
  } catch (error) {
    showMessage(pdfMessage, error.message || "FileForge could not merge those PDFs. Try different files.", "error");
  } finally {
    setPdfProcessing(false);
  }
}

async function splitPdf() {
  if (!currentPdfDocs.length) {
    showMessage(pdfMessage, "Upload a PDF first, then choose the pages you want to keep.", "error");
    return;
  }

  showMessage(pdfMessage, "Splitting PDF...", "info");
  setPdfProcessing(true);

  try {
    const { PDFDocument } = getPdfLib();
    const sourcePdf = currentPdfDocs[0];
    const pageIndexes = parsePageRange(splitRange.value, sourcePdf.getPageCount());
    const splitDocument = await PDFDocument.create();
    const copiedPages = await splitDocument.copyPages(sourcePdf, pageIndexes);

    copiedPages.forEach((page) => splitDocument.addPage(page));

    const bytes = await splitDocument.save();
    enablePdfDownload(bytes, "fileforge-split.pdf", "PDF split successfully.");
  } catch (error) {
    showMessage(pdfMessage, error.message || "FileForge could not split that PDF. Check the page range and try again.", "error");
  } finally {
    setPdfProcessing(false);
  }
}

async function loadPdfImageFile(file) {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  resetPdfDownload();

  if (!allowedTypes.includes(file.type)) {
    currentPdfImageFile = null;
    setImageToPdfEnabled(false);
    showMessage(pdfMessage, "That file cannot be converted to PDF. Please choose a JPG, PNG, or WebP image.", "error");
    return;
  }

  currentPdfImageFile = file;
  setImageToPdfEnabled(true);
  clearPdfButton.disabled = false;
  showMessage(pdfMessage, `${file.name} is ready for image-to-PDF conversion.`, "success");
}

async function convertImageToPdf() {
  if (!currentPdfImageFile) {
    showMessage(pdfMessage, "Choose an image in the Image to PDF box first.", "error");
    return;
  }

  showMessage(pdfMessage, "Converting image to PDF...", "info");
  setPdfProcessing(true);

  try {
    const { PDFDocument } = getPdfLib();
    const dataUrl = await readFileAsDataUrl(currentPdfImageFile);
    const image = await loadImageFromDataUrl(dataUrl);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    context.drawImage(image, 0, 0);

    const pngBytes = await canvasToPngBytes(canvas);
    const pdfDoc = await PDFDocument.create();
    const embeddedImage = await pdfDoc.embedPng(pngBytes);
    const pageWidth = 612;
    const pageHeight = 792;
    const margin = 36;
    const maxWidth = pageWidth - margin * 2;
    const maxHeight = pageHeight - margin * 2;
    const scale = Math.min(maxWidth / embeddedImage.width, maxHeight / embeddedImage.height, 1);
    const imageWidth = embeddedImage.width * scale;
    const imageHeight = embeddedImage.height * scale;
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    page.drawImage(embeddedImage, {
      x: (pageWidth - imageWidth) / 2,
      y: (pageHeight - imageHeight) / 2,
      width: imageWidth,
      height: imageHeight
    });

    const bytes = await pdfDoc.save();
    enablePdfDownload(bytes, "fileforge-image.pdf", "Image converted to PDF successfully.");
  } catch (error) {
    showMessage(pdfMessage, error.message || "FileForge could not turn that image into a PDF. Try another image.", "error");
  } finally {
    setPdfProcessing(false);
  }
}

resizeWidth.addEventListener("input", () => {
  updateHeightFromWidth();
  markImageOutputStale();
});

resizeHeight.addEventListener("input", () => {
  updateWidthFromHeight();
  markImageOutputStale();
});

qualitySlider.addEventListener("input", () => {
  qualityValue.textContent = `${qualitySlider.value}%`;
  markImageOutputStale();
});

outputFormat.addEventListener("change", markImageOutputStale);
compressImage.addEventListener("change", markImageOutputStale);

processImageButton.addEventListener("click", processImage);
clearImageButton.addEventListener("click", clearImageTool);
downloadImageLink.addEventListener("click", () => {
  if (!downloadImageLink.classList.contains("disabled")) {
    showMessage(imageMessage, "Download started. Your processed image is ready.", "success");
  }
});
mergePdfButton.addEventListener("click", mergePdfs);
splitPdfButton.addEventListener("click", splitPdf);
imageToPdfButton.addEventListener("click", convertImageToPdf);
clearPdfButton.addEventListener("click", clearPdfTool);
downloadPdfLink.addEventListener("click", () => {
  if (!downloadPdfLink.classList.contains("disabled")) {
    showMessage(pdfMessage, "Download started. Your processed PDF is ready.", "success");
  }
});

setupDropZone(imageDropZone, imageInput, loadImageFile);
setupDropZone(pdfDropZone, pdfInput, loadPdfFiles);
setupDropZone(pdfImageDropZone, pdfImageInput, loadPdfImageFile);
setImageControlsEnabled(false);
setPdfControlsEnabled(false);
setImageToPdfEnabled(false);
