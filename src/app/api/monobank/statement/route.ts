import { proxyLmsSlsRequest } from "@/lib/server/lms-sls";

export async function GET(request: Request) {
  return proxyLmsSlsRequest(request, "/api/monobank/statement");
}
