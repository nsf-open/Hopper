import { Version } from "@microsoft/sp-core-library";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { graph } from "@pnp/graph";
import "@pnp/polyfill-ie11";
import { registerCustomRequestClientFactory, sp } from "@pnp/sp";
import * as React from "react";
import * as ReactDom from "react-dom";
import { SspApp } from "./app/SspApp";

export interface ISelfServicePortalWebPartProps {}

export default class SelfServicePortalWebPart extends BaseClientSideWebPart<ISelfServicePortalWebPartProps> {
  public onInit(): Promise<void> {
    return super.onInit().then(() => {
      //registerCustomRequestClientFactory(() => new CustomSPHttpClient());
      sp.setup({
        ie11: true,
        spfxContext: this.context,
      });
      graph.setup({
        ie11: true,
        spfxContext: this.context,
      });
    });
  }

  public render(): void {
    var props = { Context: this.context, Graph: graph };
    const element: React.ReactElement = React.createElement(SspApp, props);
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
    registerCustomRequestClientFactory(null);
  }

  // @ts-ignore
  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }
}
