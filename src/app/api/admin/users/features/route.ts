import { requireAdminApiAccess } from "@/lib/auth/admin-server";
import {
  createTrustedAdminHeaders,
  forwardLmsSlsRequest,
  getForwardedSessionHeaders,
  mergeHeaders,
} from "@/lib/server/lms-sls";

interface FeatureRequestBody {
  action: "grant-feature" | "revoke-feature";
  authUserId: string;
  feature: string;
}

export async function POST(request: Request) {
  const access = await requireAdminApiAccess(request);
  if (!access.ok) return access.response;

  const body = (await request.json()) as FeatureRequestBody;

  return forwardLmsSlsRequest({
    body: JSON.stringify(body),
    contentType: "application/json",
    headers: mergeHeaders(
      createTrustedAdminHeaders(access.admin),
      getForwardedSessionHeaders(request.headers),
    ),
    method: "POST",
    path: "/api/internal/app-users/upsert",
  });
}
