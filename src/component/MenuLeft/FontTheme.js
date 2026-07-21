import React from "react";
import {Menu, Dropdown} from "antd";
import {observer, inject} from "mobx-react";

import {FONT_OPTIONS, RIGHT_SYMBOL} from "../../utils/constant";
import "./FontTheme.css";

@inject("navbar")
@observer
class FontTheme extends React.Component {
  changeFont = (item) => {
    this.props.navbar.setFontNum(parseInt(item.key, 10));
  };

  render() {
    const {fontNum} = this.props.navbar;
    const fontMenu = (
      <Menu onClick={this.changeFont}>
        {FONT_OPTIONS.map((option, index) => (
          <Menu.Item key={index}>
            <div id={`nice-menu-font-${option.id}`} className="nice-font-theme-item">
              <span className="nice-font-theme-flag">{fontNum === index && <span>{RIGHT_SYMBOL}</span>}</span>
              <span className="nice-font-theme-name" style={{fontFamily: option.family || undefined}}>
                {option.name}
              </span>
              <span className="nice-font-theme-sample" style={{fontFamily: option.family || undefined}}>
                Aa 字
              </span>
            </div>
          </Menu.Item>
        ))}
      </Menu>
    );

    return (
      <Dropdown overlay={fontMenu} trigger={["click"]} overlayClassName="nice-overlay">
        <a id="nice-menu-font" className="nice-menu-link" href="#">
          字体
        </a>
      </Dropdown>
    );
  }
}

export default FontTheme;
