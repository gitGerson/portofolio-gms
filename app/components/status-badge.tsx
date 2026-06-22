export function StatusBadge({ inStock }: { inStock: boolean }) {
  return inStock ? (
    <span className="inline-block rounded-md bg-ready-bg px-[7px] py-[2px] text-[9.5px] font-bold text-ready">
      READY
    </span>
  ) : (
    <span className="inline-block rounded-md bg-danger-bg px-[7px] py-[2px] text-[9.5px] font-bold text-danger">
      SOLD OUT
    </span>
  );
}

export function DiscountBadge({
  oldPrice,
  price,
}: {
  oldPrice: number;
  price: number;
}) {
  const pct = Math.round(((oldPrice - price) / oldPrice) * 100);
  return (
    <span className="rounded-md bg-gold px-[7px] py-[2px] text-[10px] font-extrabold text-ink">
      −{pct}%
    </span>
  );
}
