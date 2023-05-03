import { HopperFooter } from "./components";
import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import $ from "jquery";

export interface IHopperFooterWebPartProps {}

export default class HopperFooterWebPart extends BaseClientSideWebPart<IHopperFooterWebPartProps> {
  public render(): void {
    const element: React.ReactElement = React.createElement(HopperFooter);
    $("div.CanvasZone > div").css("max-width", "100%");
    $("div.CanvasZone").css("padding", "");
    $("div.CanvasZone > div").css("padding", "");
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  // @ts-ignore
  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }
}
