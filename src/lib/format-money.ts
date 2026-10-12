export function formatUah(amount: number | null | undefined): string | null {
  if (amount === null || amount === undefined) {
    return null;
  }

  return `${amount.toLocaleString("uk-UA")} ₴`;
}

export function sumUah(values: Array<number | null | undefined>): number {
  return values.reduce<number>((total, value) => total + (value ?? 0), 0);
}
