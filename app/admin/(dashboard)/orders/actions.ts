"use server";

import { revalidatePath } from "next/cache";
import { updateOrderStatus } from "@/lib/data/orders";
import { getAdminUser } from "@/lib/auth";
import type { OrderStatus } from "@/lib/data/types";

export async function updateStatusAction(
  id: string,
  status: OrderStatus,
): Promise<void> {
  if (!(await getAdminUser())) return;
  await updateOrderStatus(id, status);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}
