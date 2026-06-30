// Kesirli hisse adetlerini (ör. 2.33) gereksiz ondalık gürültüsü olmadan gösterir.
export function formatQty(n: number): string {
  return n.toLocaleString("tr-TR", { maximumFractionDigits: 4 });
}
