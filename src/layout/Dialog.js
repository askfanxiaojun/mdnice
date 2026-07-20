import React, {Component} from "react";
import ImageDialog from "../component/Dialog/ImageDialog";
import LinkDialog from "../component/Dialog/LinkDialog";
import AboutDialog from "../component/Dialog/AboutDialog";
import FormDialog from "../component/Dialog/FormDialog";
import HistoryDialog from "../component/Dialog/HistoryDialog";
import SitDownDialog from "../component/Dialog/SitDownDialog";
import XiaohongshuDialog from "../component/Dialog/XiaohongshuDialog";

class Dialog extends Component {
  render() {
    return (
      <div>
        <ImageDialog />
        <LinkDialog />
        <AboutDialog />
        <FormDialog />
        <HistoryDialog />
        <SitDownDialog />
        <XiaohongshuDialog />
      </div>
    );
  }
}

export default Dialog;
