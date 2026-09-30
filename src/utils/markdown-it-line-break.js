// 保留换行语义，单独为用户输入的换行增加间距；代码高亮中的 br 不受影响。
export default (md) => {
  const renderBreak = (tokens, index, options) =>
    `<span class="nice-manual-break">${options.xhtmlOut ? "<br />" : "<br>"}</span>\n`;

  md.renderer.rules.softbreak = (tokens, index, options) =>
    options.breaks ? renderBreak(tokens, index, options) : "\n";
  md.renderer.rules.hardbreak = renderBreak;
};
