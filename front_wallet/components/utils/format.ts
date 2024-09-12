// `components/utils/format.ts`


export function formatNumberWithCommas(number: number): string {
  if (number>0.9) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  return number.toString();
}