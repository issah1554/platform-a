import { optionsResponse, withCors } from "../_utils";

export function GET() {
  return withCors({
    platform: "Platform A",
    status: "ok",
    timestamp: new Date().toISOString()
  });
}

export function OPTIONS() {
  return optionsResponse();
}
