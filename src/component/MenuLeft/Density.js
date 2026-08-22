import React from "react";
import {Dropdown, Slider} from "antd";
import {observer, inject} from "mobx-react";

import {DEFAULT_DENSITY_SCALE, MAX_DENSITY_SCALE, MIN_DENSITY_SCALE} from "../../utils/constant";
import {getDensityLabel, getEstimatedCapacityGain} from "../../utils/density";
import "./Density.css";

const DENSITY_PRESETS = [
  {value: 88, label: "高密"},
  {value: DEFAULT_DENSITY_SCALE, label: "紧凑"},
  {value: 100, label: "标准"},
  {value: 106, label: "宽松"},
];

@inject("navbar")
@observer
class Density extends React.Component {
  changeDensity = (value) => {
    this.props.navbar.setDensityScale(value);
  };

  stopPropagation = (event) => {
    event.stopPropagation();
  };

  getHintText = (densityScale) => {
    const capacityGain = getEstimatedCapacityGain(densityScale);
    if (capacityGain > 0) {
      return `预计比标准排版多容纳约 ${capacityGain}% 的内容`;
    }
    if (densityScale === 100) {
      return "标准排版尺寸";
    }
    return "适合需要更醒目字号的内容";
  };

  renderOverlay = () => {
    const {densityScale} = this.props.navbar;
    return (
      <div className="nice-density-panel" onClick={this.stopPropagation}>
        <div className="nice-density-panel-header">
          <div>
            <strong>排版密度</strong>
            <span>公众号与小红书同步</span>
          </div>
          <output>{`${densityScale}%`}</output>
        </div>
        <Slider
          min={MIN_DENSITY_SCALE}
          max={MAX_DENSITY_SCALE}
          step={1}
          value={densityScale}
          tipFormatter={(value) => `${value}% · ${getDensityLabel(value)}`}
          onChange={this.changeDensity}
        />
        <div className="nice-density-scale-labels">
          <span>更多内容</span>
          <span>更大字号</span>
        </div>
        <div className="nice-density-presets">
          {DENSITY_PRESETS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              className={densityScale === preset.value ? "is-active" : ""}
              onClick={() => this.changeDensity(preset.value)}
            >
              <span>{preset.label}</span>
              <small>{`${preset.value}%`}</small>
            </button>
          ))}
        </div>
        <p className="nice-density-hint">{this.getHintText(densityScale)}</p>
      </div>
    );
  };

  render() {
    const {densityScale} = this.props.navbar;
    return (
      <Dropdown overlay={this.renderOverlay()} trigger={["click"]} overlayClassName="nice-density-overlay">
        <a id="nice-menu-density" className="nice-menu-link nice-density-menu-link" href="#">
          密度
          <span>{`${densityScale}%`}</span>
        </a>
      </Dropdown>
    );
  }
}

export default Density;
