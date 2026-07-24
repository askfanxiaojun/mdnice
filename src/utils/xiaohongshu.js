import JSZip from "jszip";
import {toBlob} from "html-to-image";

export const PAGE_WIDTH = 360;
export const PAGE_HEIGHT = 600;
export const PAGE_MARGIN = 24;
export const PAGE_CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;
export const PAGE_CONTENT_HEIGHT = PAGE_HEIGHT - PAGE_MARGIN * 2;
export const MAX_IMAGE_HEIGHT = 500;
export const DEFAULT_IMAGE_SCALE = 1;
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

.pagedjs_pages .pagedjs_page {
  margin: 0 !important;
  background: #fbfaf7 !important;
}

.pagedjs_pages .pagedjs_page .pagedjs_sheet,
.pagedjs_pages .pagedjs_page .pagedjs_pagebox {
  background: #fbfaf7 !important;
  box-shadow: none !important;
}

.pagedjs_pages .pagedjs_page .pagedjs_area,
.pagedjs_pages .pagedjs_page .pagedjs_page_content,
#nice {
  background-color: transparent !important;
}

#nice {
  box-sizing: border-box;
  padding: 0 !important;
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

#nice [data-xhs-cover-source="true"] {
  display: none !important;
}

#nice .nice-xhs-article-body {
  color: #252525 !important;
  font-size: 15px !important;
  line-height: 1.68 !important;
  letter-spacing: 0.12px !important;
}

#nice .nice-xhs-article-body p {
  padding: 0 !important;
  margin: 0 0 12px !important;
  color: #252525 !important;
  font-size: 15px !important;
  font-weight: 400 !important;
  line-height: 25px !important;
}

#nice .nice-xhs-article-body h1,
#nice .nice-xhs-article-body h2,
#nice .nice-xhs-article-body h3,
#nice .nice-xhs-article-body h4,
#nice .nice-xhs-article-body h5,
#nice .nice-xhs-article-body h6 {
  color: #202124 !important;
  background: transparent !important;
  border: 0 !important;
  text-align: left !important;
}

#nice .nice-xhs-article-body h1 {
  padding: 0 !important;
  margin: 25px 0 14px !important;
  font-size: 24px !important;
  line-height: 1.35 !important;
}

#nice .nice-xhs-article-body h2 {
  position: relative;
  padding: 1px 0 1px 13px !important;
  margin: 23px 0 15px !important;
  font-size: 21px !important;
  font-weight: 800 !important;
  line-height: 1.35 !important;
}

#nice .nice-xhs-article-body h3 {
  padding: 0 !important;
  margin: 20px 0 10px !important;
  font-size: 18px !important;
  font-weight: 750 !important;
  line-height: 1.45 !important;
}

#nice .nice-xhs-article-body h4,
#nice .nice-xhs-article-body h5,
#nice .nice-xhs-article-body h6 {
  padding: 0 !important;
  margin: 17px 0 9px !important;
  font-size: 16px !important;
  line-height: 1.45 !important;
}

#nice .nice-xhs-article-body h2:before {
  position: absolute !important;
  top: 1px !important;
  bottom: 1px !important;
  left: 0 !important;
  display: block !important;
  width: 4px !important;
  height: auto !important;
  background: var(--xhs-editorial-accent) !important;
  border: 0 !important;
  content: "" !important;
}

#nice .nice-xhs-article-body h1:after,
#nice .nice-xhs-article-body h2:after,
#nice .nice-xhs-article-body h3:after,
#nice .nice-xhs-article-body h4:after,
#nice .nice-xhs-article-body h5:after,
#nice .nice-xhs-article-body h6:after {
  display: none !important;
  content: none !important;
}

#nice .nice-xhs-article-body h1 .content,
#nice .nice-xhs-article-body h2 .content,
#nice .nice-xhs-article-body h3 .content,
#nice .nice-xhs-article-body h4 .content,
#nice .nice-xhs-article-body h5 .content,
#nice .nice-xhs-article-body h6 .content {
  display: inline !important;
  padding: 0 !important;
  margin: 0 !important;
  color: inherit !important;
  background: transparent !important;
  border: 0 !important;
  border-radius: 0 !important;
}

#nice .nice-xhs-article-body li {
  padding-left: 3px !important;
  margin: 0 0 9px !important;
  color: #252525 !important;
}

#nice .nice-xhs-article-body li section,
#nice .nice-xhs-article-body pre code span {
  padding: 0 !important;
  margin: 0 !important;
  color: #252525 !important;
  font-size: 15px !important;
  font-weight: 400 !important;
  line-height: 25px !important;
}

#nice .nice-xhs-article-body blockquote {
  box-sizing: border-box;
  padding: 11px 13px 11px 15px !important;
  margin: 14px 0 18px !important;
  color: color-mix(in srgb, var(--xhs-editorial-accent) 76%, #3d352d 24%) !important;
  background: color-mix(in srgb, var(--xhs-editorial-accent) 7%, #fbfaf7 93%) !important;
  border: 0 !important;
  border-left: 3px solid var(--xhs-editorial-accent) !important;
}

#nice .nice-xhs-article-body blockquote p {
  margin: 0 !important;
  color: inherit !important;
  font-size: 14.5px !important;
  line-height: 24px !important;
}

#nice .nice-xhs-article-body strong {
  color: var(--xhs-editorial-accent) !important;
  font-weight: 750 !important;
  border-bottom: 1px solid currentColor !important;
}

#nice .nice-xhs-article-body a {
  color: var(--xhs-editorial-accent) !important;
  border-bottom-color: currentColor !important;
}

#nice .nice-xhs-article-body pre {
  margin: 13px 0 17px !important;
}

#nice .nice-xhs-article-body pre code,
#nice .nice-xhs-article-body pre code span {
  font-size: 11.5px !important;
  line-height: 19px !important;
}

#nice .nice-xhs-article-body figure {
  margin: 14px 0 17px !important;
}

#nice .nice-xhs-article-body figcaption {
  margin-top: 6px !important;
  color: #8a8883 !important;
  font-size: 12.5px !important;
  line-height: 18px !important;
}

#nice .nice-xhs-article-body table {
  margin: 13px 0 17px !important;
  font-size: 13.5px !important;
  line-height: 21px !important;
}

#nice .nice-xhs-article-body table th,
#nice .nice-xhs-article-body table td {
  padding: 5px 7px !important;
}

#nice .nice-xhs-article-body hr {
  margin: 17px 0 !important;
  border-top-color: color-mix(in srgb, var(--xhs-editorial-accent) 30%, #d8d4cc 70%) !important;
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
  margin: 14px 0 17px;
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
