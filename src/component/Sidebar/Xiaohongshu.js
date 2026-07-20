import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {Tooltip} from "antd";

import {ENTER_DELAY, LEAVE_DELAY} from "../../utils/constant";
import SvgIcon from "../../icon";
import "./Xiaohongshu.css";

@inject("dialog")
@observer
class Xiaohongshu extends Component {
  openLayout = () => {
    this.props.dialog.setXiaohongshuOpen(true);
  };

  render() {
    return (
      <Tooltip placement="left" mouseEnterDelay={ENTER_DELAY} mouseLeaveDelay={LEAVE_DELAY} title="小红书排版">
        <a id="nice-sidebar-xiaohongshu" className="nice-btn-xiaohongshu" onClick={this.openLayout}>
          <SvgIcon name="xiaohongshu" className="nice-btn-xiaohongshu-icon" />
        </a>
      </Tooltip>
    );
  }
}

export default Xiaohongshu;
