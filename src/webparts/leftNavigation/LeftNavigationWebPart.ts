import { Version } from "@microsoft/sp-core-library";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { setup as pnpSetup } from "@pnp/common";
import { graph } from "@pnp/graph";
import * as React from "react";
import * as ReactDom from "react-dom";
import { LeftNavigation } from "./components";

export interface ILeftNavigationWebPartProps {}

export default class LeftNavigationWebPart extends BaseClientSideWebPart<ILeftNavigationWebPartProps> {
  public onInit(): Promise<void> {
    return super.onInit().then(() => {
      //registerCustomRequestClientFactory(() => new CustomSPHttpClient());
      pnpSetup({
        spfxContext: this.context,
      });
      graph.setup({ spfxContext: this.context });
    });
  }

  public render(): void {
    const element: React.ReactElement = React.createElement(LeftNavigation);

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }
}
