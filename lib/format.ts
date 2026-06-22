/** Format a number as Indonesian Rupiah, e.g. 99000 -> "Rp 99.000". */
export function formatRupiah(amount: number): string {
  return "Rp " + amount.toLocaleString("id-ID");
}
