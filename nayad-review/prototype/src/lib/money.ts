// Tugrik amounts are whole numbers. Keep them as integers end to end and only format for display.

const grouping = new Intl.NumberFormat("mn-MN", { maximumFractionDigits: 0 });

export function formatMNT(amount: number): string {
  if (!Number.isSafeInteger(amount)) {
    throw new RangeError(`Amount must be a safe integer number of tugriks, got ${amount}`);
  }
  return `${grouping.format(amount)}₮`;
}

export function sumMNT(amounts: readonly number[]): number {
  return amounts.reduce((total, a) => {
    if (!Number.isSafeInteger(a)) throw new RangeError(`Non-integer amount: ${a}`);
    return total + a;
  }, 0);
}
