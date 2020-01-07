import ApiBuilder from "claudia-api-builder";

import { proxy } from "./handlers/proxy";

const api = new ApiBuilder({ requestFormat: "AWS_PROXY" });

api.get("/proxy", proxy);

module.exports = api;
