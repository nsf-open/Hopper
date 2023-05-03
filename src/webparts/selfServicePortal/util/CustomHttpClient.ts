import { IFetchOptions, IHttpClientImpl } from "@pnp/common";
import { SPHttpClient } from "@pnp/sp";

export class CustomSPHttpClient extends SPHttpClient {
  // // optionally add a constructor, done here as an example
  // constructor(impl?: IHttpClientImpl) {
  //   super(impl);
  // }
  // // override the fetchRaw method to ensure we always include the credentials = "include" option
  // // you could also override fetch, but fetchRaw ensures no matter what all requests get your custom logic is applied
  // public fetchRaw(url: string, options?: IFetchOptions): Promise<Response> {
  //   options.credentials = "include";
  //   return super.fetchRaw(url, options);
  // }
}
