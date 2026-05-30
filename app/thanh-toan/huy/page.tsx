import { XCircle } from "lucide-react";
import PaymentResultActions from "@/components/payment/PaymentResultActions";
import { formatPrice } from "@/lib/data";
import { getPaymentReturnSummary } from "@/lib/orders";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function PaymentCancelPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const summary = await getPaymentReturnSummary(params);
  const wasPaid = summary.status === "paid";

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div
            className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl ${
              wasPaid ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
            }`}
          >
            <XCircle size={30} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="mb-2 text-sm font-black uppercase tracking-wide text-sky-600">
              SePay
            </p>
            <h1 className="text-2xl font-black text-gray-900 sm:text-3xl">
              {wasPaid ? "Đơn đã được thanh toán" : "Thanh toán đã hủy"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              {wasPaid
                ? "SePay ghi nhận đơn đã thanh toán. Giỏ hàng sẽ được làm sạch nếu đây là đơn của khách."
                : "Bạn đã hủy thanh toán hoặc link thanh toán chưa hoàn tất. Giỏ hàng vẫn được giữ để bạn thanh toán lại."}
            </p>

            <div className="mt-6 grid gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-4 text-sm sm:grid-cols-2">
              <InfoRow label="Mã đơn hàng" value={summary.orderNumber ?? "Không có"} />
              <InfoRow label="Trạng thái SePay" value={summary.providerStatus ?? "Đã hủy"} />
              <InfoRow label="Người nhận" value={summary.customerName ?? "Đang cập nhật"} />
              <InfoRow
                label="Tổng thanh toán"
                value={summary.totalAmount !== null ? formatPrice(summary.totalAmount) : "Đang cập nhật"}
              />
            </div>

            <PaymentResultActions canClearCart={summary.canClearCart} />
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase text-gray-400">{label}</p>
      <p className="mt-1 truncate font-black text-gray-900">{value}</p>
    </div>
  );
}
