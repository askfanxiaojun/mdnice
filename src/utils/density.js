const DENSITY_PROPERTIES = [
  "font-size",
  "line-height",
  "letter-spacing",
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "gap",
  "row-gap",
  "column-gap",
];

const COMPUTED_DENSITY_PROPERTIES = [
  "font-size",
  "line-height",
  "letter-spacing",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "row-gap",
  "column-gap",
];

const DENSITY_TARGETS = [
  "#nice",
  "#nice p",
  "#nice h1",
  "#nice h2",
  "#nice h3",
  "#nice h4",
  "#nice h5",
  "#nice h6",
  "#nice h1 .content",
  "#nice h2 .content",
  "#nice h3 .content",
  "#nice h4 .content",
  "#nice h5 .content",
  "#nice h6 .content",
  "#nice ul",
  "#nice ol",
  "#nice li",
  "#nice li section",
  "#nice blockquote",
  "#nice blockquote p",
  "#nice a",
  "#nice strong",
  "#nice em",
  "#nice pre",
  "#nice pre code",
  "#nice pre code span",
  "#nice p code",
  "#nice li code",
  "#nice figure",
  "#nice figcaption",
  "#nice table",
  "#nice table th",
  "#nice table td",
  "#nice hr",
  "#nice .code-snippet__fix",
  "#nice .code-snippet__line-index",
  "#nice .code-snippet__line-index li",
  "#nice .code-snippet__fix pre",
  "#nice .code-snippet__fix code",
  "#nice .footnote-num",
  "#nice .footnote-item p",
];

const DENSITY_PROBE_HTML = `
  <h1><span class="content">一级标题</span></h1>
  <h2><span class="content">二级标题</span></h2>
  <h3><span class="content">三级标题</span></h3>
  <h4><span class="content">四级标题</span></h4>
  <h5><span class="content">五级标题</span></h5>
  <h6><span class="content">六级标题</span></h6>
  <p>正文 <a href="#">链接</a> <strong>加粗</strong> <em>斜体</em> <code>行内代码</code></p>
  <ul><li><section>无序列表 <code>代码</code></section></li></ul>
  <ol><li><section>有序列表</section></li></ol>
  <blockquote><p>引用内容</p></blockquote>
  <pre class="custom"><code><span>代码内容</span></code></pre>
  <figure><figcaption>图片说明</figcaption></figure>
  <table><tbody><tr><th>标题</th><td>内容</td></tr></tbody></table>
  <hr />
  <section class="code-snippet__fix">
    <ul class="code-snippet__line-index"><li></li></ul>
    <pre><code>微信代码块</code></pre>
  </section>
  <section class="footnote-item"><span class="footnote-num">1</span><p>脚注内容</p></section>
`;

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const PROPERTY_PATTERN = new RegExp(
  `(?:^|;)\\s*(${DENSITY_PROPERTIES.map(escapeRegExp).join("|")})\\s*:\\s*([^;]+)`,
  "gi",
);

const scalePixels = (value, densityScale) =>
  value.replace(/(-?\d*\.?\d+)px/gi, (match, number) => {
    const scaled = Math.round(parseFloat(number) * (densityScale / 100) * 100) / 100;
    return `${scaled}px`;
  });

export const createDensityStyle = (css, densityScale, selectorFilter = (selector) => selector.includes("#nice")) => {
  if (!css || densityScale === 100) {
    return "";
  }

  const rules = [];
  const rulePattern = /([^{}]+)\{([^{}]*)\}/g;
  let ruleMatch = rulePattern.exec(css);

  while (ruleMatch) {
    const selector = ruleMatch[1].trim();
    if (selectorFilter(selector)) {
      const body = ruleMatch[2].replace(/\/\*[\s\S]*?\*\//g, "");
      const declarations = [];
      let declarationMatch = PROPERTY_PATTERN.exec(body);

      while (declarationMatch) {
        const value = scalePixels(declarationMatch[2].trim(), densityScale);
        if (value !== declarationMatch[2].trim()) {
          declarations.push(`${declarationMatch[1]}: ${value};`);
        }
        declarationMatch = PROPERTY_PATTERN.exec(body);
      }

      PROPERTY_PATTERN.lastIndex = 0;
      if (declarations.length) {
        rules.push(`${selector} {\n  ${declarations.join("\n  ")}\n}`);
      }
    }
    ruleMatch = rulePattern.exec(css);
  }

  return rules.join("\n");
};

export const createComputedDensityStyle = (densityScale) => {
  if (densityScale === 100 || typeof document === "undefined") {
    return "";
  }

  const wrapper = document.createElement("div");
  wrapper.setAttribute("aria-hidden", "true");
  wrapper.style.cssText =
    "position:absolute;left:-10000px;top:0;width:360px;visibility:hidden;pointer-events:none;overflow:hidden";
  const probe = document.createElement("section");
  probe.id = "nice";
  probe.innerHTML = DENSITY_PROBE_HTML;
  wrapper.appendChild(probe);
  document.body.appendChild(wrapper);

  const rules = DENSITY_TARGETS.map((selector) => {
    const localSelector = selector.replace(/^#nice\s*/, "");
    const element = localSelector ? probe.querySelector(localSelector) : probe;
    if (!element) {
      return "";
    }
    const computed = window.getComputedStyle(element);
    const declarations = COMPUTED_DENSITY_PROPERTIES.map((property) => {
      const value = computed.getPropertyValue(property).trim();
      const scaled = scalePixels(value, densityScale);
      return value && scaled !== value ? `${property}: ${scaled} !important;` : "";
    }).filter(Boolean);
    const scopedSelector = selector.replace(/^#nice/, "#nice:not(.nice-xhs-paged-source)");
    return declarations.length ? `${scopedSelector} {\n  ${declarations.join("\n  ")}\n}` : "";
  }).filter(Boolean);

  wrapper.remove();
  return rules.join("\n");
};

export const getDensityLabel = (densityScale) => {
  if (densityScale <= 89) {
    return "高密";
  }
  if (densityScale <= 96) {
    return "紧凑";
  }
  if (densityScale <= 103) {
    return "标准";
  }
  return "宽松";
};

export const getEstimatedCapacityGain = (densityScale) =>
  densityScale < 100 ? Math.round((10000 / (densityScale * densityScale) - 1) * 100) : 0;
