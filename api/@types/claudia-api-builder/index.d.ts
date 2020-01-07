declare module "claudia-api-builder" {
  interface ApiBuilderOptions {
    requestFormat: string;
  }

  interface Request {
    queryStringParameters: Record<string, string>;
  }

  type RequestCallback = (request: Request) => Promise<string | Request>;

  export default class ApiBuilder {
    constructor(options: ApiBuilderOptions);
    get(path: string, callback: RequestCallback): void;
  }
}
