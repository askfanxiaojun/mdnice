import JSZip from "jszip";
import {toBlob} from "html-to-image";

export const PAGE_WIDTH = 360;
export const PAGE_HEIGHT = 600;
export const PAGE_MARGIN = 20;
export const PAGE_CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;
export const PAGE_CONTENT_HEIGHT = PAGE_HEIGHT - PAGE_MARGIN * 2;
export const MAX_IMAGE_HEIGHT = 500;
export const OUTPUT_WIDTH = 1080;
export const OUTPUT_HEIGHT = 1800;

export const PAGED_EXPORT_CSS = `
@page {
  size: ${PAGE_WIDTH}px ${PAGE_HEIGHT}px;
  margin: ${PAGE_MARGIN}px;
}

.pagedjs_pages {
  background: transparent !important;
}

.pagedjs_page {
  margin: 0 !important;
  background: #fff !important;
}

.pagedjs_sheet,
.pagedjs_pagebox {
  background: #fff !important;
  box-shadow: none !important;
}

#nice {
  box-sizing: border-box;
  margin-top: 0 !important;
  width: 100%;
}

#nice h1,
#nice h2,
#nice h3,
#nice h4,
#nice h5,
#nice h6 {
  break-after: avoid;
  page-break-after: avoid;
}

#nice figure,
#nice .imageflow-layer3 {
  break-inside: avoid;
  page-break-inside: avoid;
}

#nice .imageflow-layer1,
#nice .imageflow-layer2,
#nice .imageflow-layer3 {
  position: static !important;
  display: block !important;
  box-sizing: border-box;
  width: 100% !important;
  height: auto !important;
  overflow: visible !important;
  transform: none !important;
  white-space: normal !important;
}

#nice .imageflow-layer3 {
  margin: 10px 0;
}

#nice img[data-xhs-image-id] {
  display: block;
  width: var(--xhs-image-width, auto) !important;
  height: auto !important;
  max-width: 100% !important;
  max-height: ${MAX_IMAGE_HEIGHT}px !important;
  object-fit: contain;
  break-inside: avoid;
  page-break-inside: avoid;
}
`;

export const sanitizeFilename = (value) => {
  const sanitized = Array.from(value || "")
    .filter((character) => character.charCodeAt(0) >= 32)
    .join("")
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/\s*-\s*/g, "-")
    .replace(/-+/g, "-")
    .replace(/\s+/g, " ")
    .replace(/[-. ]+$/g, "")
    .trim()
    .slice(0, 80);
  return sanitized || "未命名";
};

export const getDocumentTitle = (layout) => {
  const heading = layout && layout.querySelector("h1");
  return sanitizeFilename(heading ? heading.textContent : "未命名");
};

export const buildPageFilename = (title, index, pageCount) => {
  const digits = Math.max(2, String(pageCount).length);
  return `${sanitizeFilename(title)}-${String(index + 1).padStart(digits, "0")}.png`;
};

export const collectImageSources = (pages) => {
  const sources = new Set();
  pages.forEach((page) => {
    page.querySelectorAll("img").forEach((image) => {
      if (image.currentSrc || image.src) {
        sources.add(image.currentSrc || image.src);
      }
    });
  });
  return Array.from(sources);
};

const isFetchableUrl = (url) => /^https?:\/\//i.test(url);

export const assertImagesExportable = async (pages) => {
  const sources = collectImageSources(pages);
  await Promise.all(
    sources.filter(isFetchableUrl).map(async (source) => {
      try {
        const response = await window.fetch(source, {
          mode: "cors",
          credentials: "same-origin",
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        throw new Error(`图片无法跨域导出：${source}`);
      }
    }),
  );
};

export const waitForImages = (container) => {
  const images = Array.from(container.querySelectorAll("img"));
  return Promise.all(
    images.map(
      (image) =>
        new Promise((resolve, reject) => {
          if (image.complete) {
            if (image.naturalWidth > 0) {
              resolve();
            } else {
              reject(new Error(`图片加载失败：${image.currentSrc || image.src}`));
            }
            return;
          }
          image.addEventListener("load", resolve, {once: true});
          image.addEventListener("error", () => reject(new Error(`图片加载失败：${image.currentSrc || image.src}`)), {
            once: true,
          });
        }),
    ),
  );
};

export const validatePngDimensions = (blob) =>
  new Promise((resolve, reject) => {
    const url = window.URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      window.URL.revokeObjectURL(url);
      if (image.naturalWidth !== OUTPUT_WIDTH || image.naturalHeight !== OUTPUT_HEIGHT) {
        reject(new Error(`导出尺寸异常：${image.naturalWidth}×${image.naturalHeight}`));
        return;
      }
      resolve();
    };
    image.onerror = () => {
      window.URL.revokeObjectURL(url);
      reject(new Error("生成的 PNG 无法读取"));
    };
    image.src = url;
  });

const triggerDownload = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
};

export const exportPagesToZip = async ({pages, title, onProgress}) => {
  await assertImagesExportable(pages);
  const zip = new JSZip();
  const pageCount = pages.length;

  await pages.reduce(
    (previous, page, index) =>
      previous.then(async () => {
        const blob = await toBlob(page, {
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          canvasWidth: OUTPUT_WIDTH,
          canvasHeight: OUTPUT_HEIGHT,
          pixelRatio: 1,
          backgroundColor: "#fff",
          includeQueryParams: true,
          skipAutoScale: true,
          filter: (node) => !(node.classList && node.classList.contains("nice-xhs-export-exclude")),
        });
        if (!blob) {
          throw new Error(`第 ${index + 1} 页生成失败`);
        }
        await validatePngDimensions(blob);
        zip.file(buildPageFilename(title, index, pageCount), blob, {binary: true});
        if (onProgress) {
          onProgress(index + 1, pageCount);
        }
      }),
    Promise.resolve(),
  );

  const archive = await zip.generateAsync({type: "blob", compression: "STORE"});
  triggerDownload(archive, `${sanitizeFilename(title)}-小红书排版.zip`);
  return archive;
};
