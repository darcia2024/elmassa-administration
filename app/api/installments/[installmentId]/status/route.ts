import { NextRequest, NextResponse } from "next/server";
import {
  isAllowedInstallmentStatus,
  listAllowedInstallmentStatuses,
  markInstallmentPaid,
  updateInstallment,
} from "@/lib/installments/store";

type InstallmentStatusRouteProps = {
  params: Promise<{
    installmentId: string;
  }>;
};

export async function PATCH(request: NextRequest, { params }: InstallmentStatusRouteProps) {
  const { installmentId } = await params;
  const body = await request.json().catch(() => ({}));
  const status = typeof body.status === "string" ? body.status.trim() : "";

  if (!isAllowedInstallmentStatus(status)) {
    return NextResponse.json(
      {
        error: "Status cicilan tidak valid",
        details: [`status harus salah satu dari: ${listAllowedInstallmentStatuses().join(", ")}`],
      },
      { status: 400 },
    );
  }

  const id = decodeURIComponent(installmentId);
  const data = status === "Lunas" ? await markInstallmentPaid(id) : await updateInstallment(id, { status });

  if (!data) {
    return NextResponse.json({ error: "Cicilan tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({
    data,
    meta: {
      statusUpdated: true,
    },
  });
}
