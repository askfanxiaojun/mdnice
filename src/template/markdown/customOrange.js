import customBlue from "./customBlue";

const ORANGE_BACKGROUND = "rgb(250, 237, 218)";
const ORANGE_ACCENT = "rgb(126, 77, 38)";
const ORANGE_TEXT = "rgb(92, 53, 24)";
const ORANGE_BORDER = "rgba(250, 237, 218, 0.08)";
const ORANGE_LIST_BACKGROUND = "rgba(250, 237, 218, 0.3)";
const ORANGE_QUOTE_BACKGROUND = "rgba(250, 237, 218, 0.5)";

const customOrange = customBlue
  .replace(/rgba\(15, 76, 129, 1\)/g, ORANGE_ACCENT)
  .replace(/rgba\(15, 76, 129, 0\.08\)/g, ORANGE_BORDER)
  .replace(/rgba\(15, 76, 129, 0\.05\)/g, ORANGE_LIST_BACKGROUND);

export default `${customOrange}
#nice h2 .content {
  background: ${ORANGE_BACKGROUND};
  color: ${ORANGE_TEXT};
}
#nice blockquote {
  background: ${ORANGE_QUOTE_BACKGROUND};
}`;
