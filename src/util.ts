const formatter = Intl.NumberFormat("en", { notation: "compact" });

export const compactNumber = (n: number) => {
  return formatter.format(n);
};
