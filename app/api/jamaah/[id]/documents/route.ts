import { handleDocumentUpload } from "@/lib/jamaah/upload";

type RouteProps = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteProps) {
  const { id } = await params;
  return handleDocumentUpload(request, id, {
    via: "admin",
    actor: request.headers.get("x-el-massa-user-id") ?? "",
  });
}
