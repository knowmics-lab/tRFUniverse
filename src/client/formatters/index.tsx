const INTEGER_FORMAT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const NUMBER_FORMAT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 });
const P_VALUE_FORMAT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

export const formatInteger = (n: number) => INTEGER_FORMAT.format(n);
export const formatNumber = (n: number) => NUMBER_FORMAT.format(n);
export const formatP = (value: number) => (value < 0.01 ? " < 0.01" : P_VALUE_FORMAT.format(value));
export const formatPStars = (x: number) => {
    if (x < 0.001) return "***";
    if (x < 0.01) return "**";
    if (x < 0.05) return "*";
    if (x < 0.1) return ".";
    return "";
};
