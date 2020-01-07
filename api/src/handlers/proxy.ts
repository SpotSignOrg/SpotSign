import fetch from "node-fetch";

export const proxy = async request => {
  const url = request.queryStringParameters.url;
  const response = await fetch(url);
  const body = await response.text();
  return body;
};
