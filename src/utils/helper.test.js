import {markdownParser, markdownParserWechat} from "./helper";

const render = (parser, markdown) => {
  const container = document.createElement("div");
  container.innerHTML = parser.render(markdown);
  return container;
};

[
  ["普通代码主题", markdownParser],
  ["微信代码主题", markdownParserWechat],
].forEach(([name, parser]) => {
  describe(`${name}的换行行为`, () => {
    it("单次回车在同一段落内生成换行，包括 Windows 换行符", () => {
      ["第一行\n第二行", "第一行\r\n第二行"].forEach((markdown) => {
        const result = render(parser, markdown);
        expect(result.querySelectorAll("p")).toHaveLength(1);
        expect(result.querySelectorAll("p br")).toHaveLength(1);
        expect(result.textContent).toContain("第一行");
        expect(result.textContent).toContain("第二行");
      });
    });

    it("空行仍然分成独立段落", () => {
      const result = render(parser, "第一段\n\n第二段");
      expect(result.querySelectorAll("p")).toHaveLength(2);
      expect(result.querySelectorAll("br")).toHaveLength(0);
    });

    it("显式 Markdown 换行不会生成重复换行", () => {
      ["第一行  \n第二行", "第一行\\\n第二行"].forEach((markdown) => {
        expect(render(parser, markdown).querySelectorAll("br")).toHaveLength(1);
      });
    });

    it("引用和列表项内的续行同样换行", () => {
      expect(render(parser, "> 第一行\n> 第二行").querySelectorAll("blockquote br")).toHaveLength(1);
      const list = render(parser, "- 第一行\n  第二行\n- 下一项");
      expect(list.querySelectorAll("li")).toHaveLength(2);
      expect(list.querySelectorAll("li br")).toHaveLength(1);
    });

    it("代码块的换行不会被当作正文换行", () => {
      const result = render(parser, "```\nfirst\nsecond\n```");
      expect(result.querySelectorAll("pre")).toHaveLength(1);
      expect(result.querySelectorAll("br")).toHaveLength(0);
      expect(result.textContent).toContain("first");
      expect(result.textContent).toContain("second");
    });

    it("标题、表格和列表仍保持块结构", () => {
      const result = render(parser, "# 标题\n\n| A | B |\n| --- | --- |\n| 1 | 2 |\n\n- 一\n- 二");
      expect(result.querySelectorAll("h1")).toHaveLength(1);
      expect(result.querySelectorAll("table")).toHaveLength(1);
      expect(result.querySelectorAll("li")).toHaveLength(2);
      expect(result.querySelectorAll("br")).toHaveLength(0);
    });
  });
});
