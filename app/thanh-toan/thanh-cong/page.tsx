import { CheckCircle2, Clock3, ReceiptText } from "lucide-react";
import PaymentResultActions from "@/components/payment/PaymentResultActions";
import { formatPrice } from "@/lib/data";
import { getPaymentReturnSummary } from "@/lib/orders";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const summary = await getPaymentReturnSummary(params);
  const isPaid = summary.status === "paid";

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <section className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div
            className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl ${
              isPaid ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
            }`}
          >
            {isPaid ? <CheckCircle2 size={30} /> : <Clock3 size={30} />}
          </div>

          <div className="min-w-0 flex-1">
            <p className="mb-2 text-sm font-black uppercase tracking-wide text-sky-600">
              SePay
            </p>
            <h1 className="text-2xl font-black text-gray-900 sm:text-3xl">
              {isPaid ? "Thanh toán thành công" : "Đang xác nhận thanh toán"}
            </h1>
            <p className="mt-3 text-sm leading-6 text-gray-600">{summary.message}</p>

            <div className="mt-6 grid gap-3 rounded-2xl border border-sky-100 bg-sky-50/60 p-4 text-sm sm:grid-cols-2">
              <InfoRow label="Mã đơn hàng" value={summary.orderNumber ?? "Không có"} />
              <InfoRow label="Trạng thái SePay" value={summary.providerStatus ?? "Đang chờ"} />
              <InfoRow label="Người nhận" value={summary.customerName ?? "Đang cập nhật"} />
              <InfoRow
                label="Tổng thanh toán"
                value={summary.totalAmount !== null ? formatPrice(summary.totalAmount) : "Đang cập nhật"}
              />
            </div>

            {!isPaid && (
              <div className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                <ReceiptText size={18} className="mt-0.5 flex-shrink-0" />
                <span>
                  Nếu bạn đã chuyển khoản, IPN SePay có thể cần vài giây để cập nhật. Bấm cập nhật trạng thái sau một lúc.
                </span>
              </div>
            )}

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
