import JSZip from "jszip";
import {toBlob} from "html-to-image";

export const PAGE_WIDTH = 360;
export const PAGE_HEIGHT = 600;
export const PAGE_MARGIN = 14;
export const PAGE_CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;
export const PAGE_CONTENT_HEIGHT = PAGE_HEIGHT - PAGE_MARGIN * 2;
export const MAX_IMAGE_HEIGHT = 500;
export const DEFAULT_IMAGE_SCALE = 0.9;
export const OUTPUT_WIDTH = 1080;
export const OUTPUT_HEIGHT = 1800;

const normalizeTitle = (value) => (value || "").replace(/\s+/g, " ").trim();

export const getDocumentTitleSource = (layout) => {
  if (!layout) {
    return null;
  }
  const heading = layout.querySelector("h1");
  if (heading && normalizeTitle(heading.textContent)) {
    return heading;
  }
  return Array.from(layout.children).find((element) => normalizeTitle(element.textContent)) || null;
};

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

#nice .nice-xhs-cover {
  --xhs-cover-accent: #b98a44;
  --xhs-cover-font: Optima-Regular, Optima, "PingFang SC", serif;
  position: relative;
  box-sizing: border-box;
  min-height: 246px;
  padding-top: 68px;
  break-inside: avoid;
  page-break-inside: avoid;
}

#nice .nice-xhs-cover:before {
  position: absolute;
  top: -${PAGE_MARGIN}px;
  right: -${PAGE_MARGIN}px;
  left: -${PAGE_MARGIN}px;
  height: 13px;
  background: color-mix(in srgb, var(--xhs-cover-accent) 14%, #fff 86%);
  content: "";
}

#nice .nice-xhs-cover-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 5px 9px;
  color: color-mix(in srgb, var(--xhs-cover-accent) 72%, #55412f 28%);
  font-family: var(--xhs-cover-font) !important;
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 1.8px;
  line-height: 1;
}

#nice .nice-xhs-cover-meta:after {
  width: 34px;
  height: 1px;
  margin-left: 10px;
  background: currentColor;
  content: "";
}

#nice .nice-xhs-cover-title-frame {
  position: relative;
  box-sizing: border-box;
  padding: 10px 13px 11px 17px;
  background: color-mix(in srgb, var(--xhs-cover-accent) 13%, #fffaf1 87%);
}

#nice .nice-xhs-cover-title-frame:before,
#nice .nice-xhs-cover-title-frame:after {
  position: absolute;
  background: var(--xhs-cover-accent);
  content: "";
}

#nice .nice-xhs-cover-title-frame:before {
  top: 0;
  bottom: 0;
  left: 0;
  width: 3px;
}

#nice .nice-xhs-cover-title-frame:after {
  right: 0;
  bottom: 0;
  width: 3px;
  height: 34%;
}

#nice .nice-xhs-cover-title {
  padding: 0 !important;
  margin: 0 !important;
  color: #24160c !important;
  background: transparent !important;
  border: 0 !important;
  font-family: var(--xhs-cover-font) !important;
  font-size: 38px !important;
  font-weight: 800 !important;
  letter-spacing: -1.2px !important;
  line-height: 1.16 !important;
  text-align: left !important;
  overflow-wrap: anywhere;
}

#nice .nice-xhs-cover-title:before,
#nice .nice-xhs-cover-title:after {
  display: none !important;
  content: none !important;
}

#nice .nice-xhs-cover-title.is-long {
  font-size: 31px !important;
  letter-spacing: -0.8px !important;
  line-height: 1.2 !important;
}

#nice .nice-xhs-cover-title.is-very-long {
  font-size: 25px !important;
  letter-spacing: -0.3px !important;
  line-height: 1.24 !important;
}

#nice .nice-xhs-cover-tail {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 13px 5px 0;
  color: color-mix(in srgb, var(--xhs-cover-accent) 72%, #55412f 28%);
  font-family: var(--xhs-cover-font) !important;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1px;
  line-height: 1;
}

#nice .nice-xhs-cover-tail:before {
  width: 3px;
  height: 17px;
  background: currentColor;
  content: "";
}

#nice [data-xhs-cover-source="true"] {
  display: none !important;
}

#nice .nice-xhs-article-body {
  font-size: 14.5px !important;
  line-height: 1.48 !important;
}

#nice .nice-xhs-article-body p {
  padding-top: 2px !important;
  padding-bottom: 2px !important;
  font-size: 14.5px !important;
  line-height: 21px !important;
}

#nice .nice-xhs-article-body h1,
#nice .nice-xhs-article-body h2,
#nice .nice-xhs-article-body h3,
#nice .nice-xhs-article-body h4,
#nice .nice-xhs-article-body h5,
#nice .nice-xhs-article-body h6 {
  margin-top: 16px !important;
  margin-bottom: 7px !important;
}

#nice .nice-xhs-article-body h1 {
  font-size: 22px !important;
}

#nice .nice-xhs-article-body h2 {
  font-size: 20px !important;
}

#nice .nice-xhs-article-body h3 {
  font-size: 18px !important;
}

#nice .nice-xhs-article-body h4,
#nice .nice-xhs-article-body h5,
#nice .nice-xhs-article-body h6 {
  font-size: 16px !important;
}

#nice .nice-xhs-article-body ul,
#nice .nice-xhs-article-body ol {
  margin-top: 4px !important;
  margin-bottom: 4px !important;
  padding-top: 5px !important;
  padding-bottom: 5px !important;
}

#nice .nice-xhs-article-body li section,
#nice .nice-xhs-article-body blockquote p,
#nice .nice-xhs-article-body pre code span {
  line-height: 21px !important;
}

#nice .nice-xhs-article-body blockquote {
  margin-top: 8px !important;
  margin-bottom: 8px !important;
  padding-top: 6px !important;
  padding-bottom: 6px !important;
}

#nice .nice-xhs-article-body pre,
#nice .nice-xhs-article-body figure {
  margin-top: 7px !important;
  margin-bottom: 7px !important;
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
  const source = getDocumentTitleSource(layout);
  return normalizeTitle(source ? source.textContent : "未命名") || "未命名";
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
