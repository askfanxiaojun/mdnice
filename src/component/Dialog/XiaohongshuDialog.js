import React, {Component} from "react";
import ReactDOM from "react-dom";
import {observer, inject} from "mobx-react";
import {Button, message, Select} from "antd";
import {Previewer} from "pagedjs";

import {
  BASIC_THEME_ID,
  CODE_THEME_ID,
  FONT_THEME_ID,
  FONT_OPTIONS,
  LAYOUT_ID,
  MARKDOWN_THEME_ID,
  TEMPLATE_OPTIONS,
} from "../../utils/constant";
import {
  exportPagesToZip,
  DEFAULT_IMAGE_SCALE,
  getDocumentTitle,
  getDocumentTitleSource,
  MAX_IMAGE_HEIGHT,
  PAGE_CONTENT_WIDTH,
  PAGED_EXPORT_CSS,
  waitForImages,
} from "../../utils/xiaohongshu";
import "./XiaohongshuDialog.css";

const INITIAL_STATE = {
  title: "未命名",
  themeName: "",
  pageCount: 0,
  isPreparing: false,
  isExporting: false,
  exportProgress: 0,
  error: "",
  imageSizes: {},
};

@inject("dialog")
@inject("navbar")
@observer
class XiaohongshuDialog extends Component {
  isActive = false;

  snapshot = null;

  previewer = null;

  renderTarget = null;

  paginationToken = 0;

  resizeState = null;

  previousBodyOverflow = "";

  constructor(props) {
    super(props);
    this.state = {...INITIAL_STATE};
  }

  componentDidUpdate() {
    const {isXiaohongshuOpen} = this.props.dialog;
    if (isXiaohongshuOpen && !this.isActive) {
      this.isActive = true;
      this.previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", this.handleKeyDown);
      this.openWorkspace();
    } else if (!isXiaohongshuOpen && this.isActive) {
      this.isActive = false;
      this.cleanup();
    }
  }

  componentWillUnmount() {
    this.cleanup();
  }

  openWorkspace = () => {
    this.setState({...INITIAL_STATE, isPreparing: true}, this.prepareSnapshot);
  };

  collectStyles = () =>
    [BASIC_THEME_ID, MARKDOWN_THEME_ID, CODE_THEME_ID, FONT_THEME_ID]
      .map((id) => {
        const style = document.getElementById(id);
        return style ? style.textContent : "";
      })
      .join("\n");

  prepareSnapshot = async () => {
    try {
      const layout = document.getElementById(LAYOUT_ID);
      if (!layout) {
        throw new Error("没有找到 Markdown 预览内容");
      }
      await waitForImages(layout);
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      const clone = layout.cloneNode(true);
      const titleSource = getDocumentTitleSource(clone);
      const title = getDocumentTitle(clone);
      if (titleSource) {
        titleSource.setAttribute("data-xhs-cover-source", "true");
      }
      const sourceImages = Array.from(layout.querySelectorAll("img"));
      const clonedImages = Array.from(clone.querySelectorAll("img"));
      const imageMeta = {};

      clonedImages.forEach((image, index) => {
        const sourceImage = sourceImages[index];
        const id = `xhs-image-${index}`;
        const rect = sourceImage ? sourceImage.getBoundingClientRect() : {width: PAGE_CONTENT_WIDTH};
        const naturalWidth = sourceImage ? sourceImage.naturalWidth : 0;
        const naturalHeight = sourceImage ? sourceImage.naturalHeight : 0;
        const ratio = naturalWidth && naturalHeight ? naturalWidth / naturalHeight : 1;
        const heightLimitedWidth = MAX_IMAGE_HEIGHT * ratio;
        const fittedWidth = Math.min(rect.width || PAGE_CONTENT_WIDTH, PAGE_CONTENT_WIDTH, heightLimitedWidth);
        imageMeta[id] = {
          initialWidth: Math.max(48, fittedWidth * DEFAULT_IMAGE_SCALE),
          maxWidth: Math.max(48, Math.min(PAGE_CONTENT_WIDTH, heightLimitedWidth)),
        };
        image.setAttribute("data-xhs-image-id", id);
      });

      const template = TEMPLATE_OPTIONS[this.props.navbar.templateNum];
      const fontOption = FONT_OPTIONS[this.props.navbar.fontNum] || FONT_OPTIONS[0];
      this.snapshot = {
        html: clone.innerHTML,
        css: this.collectStyles(),
        imageMeta,
        title,
        accentColor: this.getThemeAccent(layout),
        fontFamily: fontOption.family || window.getComputedStyle(layout).fontFamily,
      };
      this.setState(
        {
          title,
          themeName: template ? template.name : "当前主题",
          imageSizes: {},
          error: "",
        },
        this.paginate,
      );
    } catch (error) {
      this.setState({isPreparing: false, error: error.message || "小红书排版初始化失败"});
    }
  };

  getThemeAccent = (layout) => {
    const candidates = [
      layout.querySelector("h2 .content"),
      layout.querySelector("strong"),
      layout.querySelector("a"),
      layout.querySelector("h2"),
    ].filter(Boolean);
    for (let index = 0; index < candidates.length; index += 1) {
      const style = window.getComputedStyle(candidates[index]);
      if (style.backgroundColor && style.backgroundColor !== "rgba(0, 0, 0, 0)") {
        return style.backgroundColor;
      }
      if (style.color && style.color !== "rgb(0, 0, 0)") {
        return style.color;
      }
    }
    return "#b98a44";
  };

  getImageWidth = (id) => {
    const {imageSizes} = this.state;
    const meta = this.snapshot.imageMeta[id];
    return Math.min(imageSizes[id] || meta.initialWidth, meta.maxWidth);
  };

  createPagedSource = () => {
    const documentRoot = document.createElement("div");
    documentRoot.className = "nice-xhs-paged-document";
    const source = document.createElement("section");
    source.id = LAYOUT_ID;
    source.className = "nice-xhs-paged-source";
    source.innerHTML = this.snapshot.html;
    const articleBody = document.createElement("div");
    articleBody.className = "nice-xhs-article-body";
    Array.from(source.childNodes).forEach((node) => articleBody.appendChild(node));

    const cover = document.createElement("header");
    cover.className = "nice-xhs-cover";
    cover.style.setProperty("--xhs-cover-accent", this.snapshot.accentColor);
    cover.style.setProperty("--xhs-cover-font", this.snapshot.fontFamily);
    const meta = document.createElement("div");
    meta.className = "nice-xhs-cover-meta";
    meta.textContent = "专题文章 · 01";
    const titleFrame = document.createElement("div");
    titleFrame.className = "nice-xhs-cover-title-frame";
    const title = document.createElement("h1");
    title.className = "nice-xhs-cover-title";
    if (this.snapshot.title.length > 46) {
      title.classList.add("is-very-long");
    } else if (this.snapshot.title.length > 28) {
      title.classList.add("is-long");
    }
    title.textContent = this.snapshot.title;
    titleFrame.appendChild(title);
    const tail = document.createElement("div");
    tail.className = "nice-xhs-cover-tail";
    tail.textContent = "文章导读";
    cover.appendChild(meta);
    cover.appendChild(titleFrame);
    cover.appendChild(tail);
    source.appendChild(cover);
    source.appendChild(articleBody);
    source.querySelectorAll("img[data-xhs-image-id]").forEach((image) => {
      const id = image.getAttribute("data-xhs-image-id");
      image.style.setProperty("--xhs-image-width", `${this.getImageWidth(id)}px`);
    });
    documentRoot.appendChild(source);
    return documentRoot;
  };

  destroyPreview = () => {
    if (this.previewer) {
      try {
        this.previewer.chunker.destroy();
      } catch (error) {
        // Paged.js 可能尚未完成首次渲染。
      }
      try {
        this.previewer.polisher.destroy();
      } catch (error) {
        // Paged.js 可能尚未插入样式。
      }
      this.previewer = null;
    }
    if (this.renderTarget) {
      this.renderTarget.innerHTML = "";
    }
  };

  paginate = async () => {
    if (!this.snapshot || !this.renderTarget || !this.isActive) {
      return;
    }
    const token = this.paginationToken + 1;
    this.paginationToken = token;
    this.setState({isPreparing: true, error: "", pageCount: 0});
    this.destroyPreview();

    try {
      const source = this.createPagedSource();
      this.previewer = new Previewer();
      const styleUrl = `${window.location.href.split("#")[0]}#xiaohongshu-export`;
      await this.previewer.preview(
        source,
        [{[styleUrl]: `${this.snapshot.css}\n${PAGED_EXPORT_CSS}`}],
        this.renderTarget,
      );
      if (token !== this.paginationToken || !this.isActive) {
        return;
      }
      await waitForImages(this.renderTarget);
      const pages = Array.from(this.renderTarget.querySelectorAll(".pagedjs_page"));
      if (!pages.length) {
        throw new Error("当前内容没有生成可导出的页面");
      }
      this.addPageControls(pages);
      this.setState({isPreparing: false, pageCount: pages.length});
    } catch (error) {
      if (token === this.paginationToken) {
        console.error("小红书分页失败", error);
        this.setState({isPreparing: false, error: error.message || "分页失败，请检查当前主题 CSS"});
      }
    }
  };

  addPageControls = (pages) => {
    pages.forEach((page, pageIndex) => {
      page.classList.add("nice-xhs-page");
      const pageLabel = document.createElement("span");
      pageLabel.className = "nice-xhs-page-label nice-xhs-export-exclude";
      pageLabel.textContent = `${String(pageIndex + 1).padStart(2, "0")} / ${String(pages.length).padStart(2, "0")}`;
      page.appendChild(pageLabel);

      page.querySelectorAll("img[data-xhs-image-id]").forEach((image) => {
        const handle = document.createElement("button");
        handle.type = "button";
        handle.className = "nice-xhs-resize-handle nice-xhs-export-exclude";
        handle.setAttribute("aria-label", "拖动调整图片大小");
        handle.setAttribute("data-xhs-image-id", image.getAttribute("data-xhs-image-id"));
        handle.addEventListener("pointerdown", this.handleResizeStart);
        page.appendChild(handle);
        this.positionResizeHandle(handle, image, page);
      });
    });
  };

  positionResizeHandle = (handle, image, page) => {
    const pageRect = page.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();
    handle.style.left = `${imageRect.right - pageRect.left - 8}px`;
    handle.style.top = `${imageRect.bottom - pageRect.top - 8}px`;
  };

  handleResizeStart = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const id = event.currentTarget.getAttribute("data-xhs-image-id");
    const page = event.currentTarget.closest(".pagedjs_page");
    const image = page.querySelector(`img[data-xhs-image-id="${id}"]`);
    if (!image) {
      return;
    }
    this.resizeState = {
      id,
      startX: event.clientX,
      startWidth: image.getBoundingClientRect().width,
      maxWidth: this.snapshot.imageMeta[id].maxWidth,
      handle: event.currentTarget,
      image,
      page,
    };
    document.body.classList.add("nice-xhs-is-resizing");
    window.addEventListener("pointermove", this.handleResizeMove);
    window.addEventListener("pointerup", this.handleResizeEnd, {once: true});
  };

  handleResizeMove = (event) => {
    if (!this.resizeState) {
      return;
    }
    const {startX, startWidth, maxWidth, image, handle, page} = this.resizeState;
    const width = Math.max(48, Math.min(startWidth + event.clientX - startX, maxWidth));
    image.style.setProperty("width", `${width}px`, "important");
    image.style.setProperty("height", "auto", "important");
    this.resizeState.width = width;
    this.positionResizeHandle(handle, image, page);
  };

  handleResizeEnd = () => {
    window.removeEventListener("pointermove", this.handleResizeMove);
    document.body.classList.remove("nice-xhs-is-resizing");
    if (!this.resizeState) {
      return;
    }
    const {id, width, startWidth} = this.resizeState;
    this.resizeState = null;
    this.setState(
      ({imageSizes}) => ({
        imageSizes: {...imageSizes, [id]: width || startWidth},
      }),
      this.paginate,
    );
  };

  resetImageSizes = () => {
    if (this.state.isPreparing || this.state.isExporting) {
      return;
    }
    this.setState({imageSizes: {}}, this.paginate);
  };

  changeFont = (fontNum) => {
    if (this.state.isPreparing || this.state.isExporting || !this.snapshot) {
      return;
    }
    this.props.navbar.setFontNum(fontNum);
    const layout = document.getElementById(LAYOUT_ID);
    const fontOption = FONT_OPTIONS[fontNum] || FONT_OPTIONS[0];
    this.snapshot.fontFamily = fontOption.family || window.getComputedStyle(layout).fontFamily;
    this.snapshot.css = this.collectStyles();
    this.paginate();
  };

  getExportPages = () =>
    Array.from(this.renderTarget.querySelectorAll(".pagedjs_page")).map((page) => page.querySelector(".pagedjs_sheet"));

  downloadAll = async () => {
    if (this.state.isPreparing || this.state.isExporting || !this.state.pageCount) {
      return;
    }
    this.setState({isExporting: true, exportProgress: 0, error: ""});
    try {
      const pages = this.getExportPages();
      await exportPagesToZip({
        pages,
        title: this.state.title,
        onProgress: (current, total) => {
          this.setState({exportProgress: Math.round((current / total) * 100)});
        },
      });
      message.success(`已下载 ${pages.length} 张小红书排版图片`);
    } catch (error) {
      this.setState({error: error.message || "导出失败，请检查图片地址后重试"});
    } finally {
      if (this.isActive) {
        this.setState({isExporting: false});
      }
    }
  };

  handleKeyDown = (event) => {
    if (event.key === "Escape") {
      this.closeDialog();
    }
  };

  closeDialog = () => {
    if (!this.state.isExporting) {
      this.props.dialog.setXiaohongshuOpen(false);
    }
  };

  cleanup = () => {
    this.paginationToken += 1;
    window.removeEventListener("pointermove", this.handleResizeMove);
    window.removeEventListener("pointerup", this.handleResizeEnd);
    document.removeEventListener("keydown", this.handleKeyDown);
    document.body.classList.remove("nice-xhs-is-resizing");
    document.body.style.overflow = this.previousBodyOverflow;
    this.resizeState = null;
    this.destroyPreview();
    this.snapshot = null;
  };

  render() {
    if (!this.props.dialog.isXiaohongshuOpen) {
      return null;
    }

    const {title, themeName, pageCount, isPreparing, isExporting, exportProgress, error} = this.state;
    const downloadText = isExporting ? `正在生成 ${exportProgress}%` : "下载全部 ZIP";

    return ReactDOM.createPortal(
      <div className="nice-xhs-workspace" role="dialog" aria-modal="true" aria-label="小红书排版">
        <header className="nice-xhs-header">
          <div className="nice-xhs-brand">
            <span className="nice-xhs-brand-mark">RED</span>
            <div>
              <h2>小红书排版</h2>
              <p>固定 1080 × 1800 · 紧凑分页 · 首页封面</p>
            </div>
          </div>
          <div className="nice-xhs-document-meta">
            <span className="nice-xhs-meta-label">文档</span>
            <strong title={title}>{title}</strong>
            <span className="nice-xhs-meta-divider" />
            <span className="nice-xhs-meta-label">主题</span>
            <strong>{themeName}</strong>
            <span className="nice-xhs-meta-divider" />
            <span className="nice-xhs-meta-label">页数</span>
            <strong>{pageCount || "—"}</strong>
          </div>
          <div className="nice-xhs-actions">
            <label className="nice-xhs-font-control" htmlFor="nice-xhs-font-select">
              <span>字体</span>
              <Select
                id="nice-xhs-font-select"
                value={this.props.navbar.fontNum}
                disabled={isPreparing || isExporting}
                dropdownClassName="nice-xhs-font-dropdown"
                dropdownMatchSelectWidth={false}
                onChange={this.changeFont}
              >
                {FONT_OPTIONS.map((option, index) => (
                  <Select.Option key={option.id} value={index}>
                    {option.name}
                  </Select.Option>
                ))}
              </Select>
            </label>
            <Button disabled={isPreparing || isExporting} onClick={this.resetImageSizes}>
              重置图片大小
            </Button>
            <Button
              id="nice-xhs-download"
              type="primary"
              loading={isExporting}
              disabled={isPreparing || !pageCount}
              onClick={this.downloadAll}
            >
              {downloadText}
            </Button>
            <button
              className="nice-xhs-close"
              type="button"
              aria-label="关闭小红书排版"
              disabled={isExporting}
              onClick={this.closeDialog}
            >
              ×
            </button>
          </div>
        </header>

        <main className="nice-xhs-stage">
          <div className="nice-xhs-stage-heading">
            <span>分页预览</span>
            <small>拖动图片右下角的红色控制点可等比例缩放，松开后自动重新分页</small>
          </div>
          {error && <div className="nice-xhs-error">{error}</div>}
          {isPreparing && (
            <div className="nice-xhs-loading">
              <span className="nice-xhs-loading-dot" />
              正在计算分页与图片位置…
            </div>
          )}
          <div
            className={`nice-xhs-pages${isPreparing ? " nice-xhs-pages-loading" : ""}`}
            ref={(node) => {
              this.renderTarget = node;
            }}
          />
        </main>
      </div>,
      document.body,
    );
  }
}

export default XiaohongshuDialog;
