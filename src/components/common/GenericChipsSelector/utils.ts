// [bgLight, textLight, bgDark, textDark]
const CHIP_PALETTE: [string, string, string, string][] = [
    ["#ede9fe", "#5b21b6", "#3b0764", "#e9d5ff"],
    ["#fde68a", "#92400e", "#451a03", "#fde68a"],
    ["#bbf7d0", "#14532d", "#052e16", "#86efac"],
    ["#bfdbfe", "#1e3a5f", "#0c1a3a", "#93c5fd"],
    ["#fecdd3", "#9f1239", "#4c0519", "#fda4af"],
    ["#d1fae5", "#064e3b", "#022c22", "#6ee7b7"],
    ["#fef08a", "#713f12", "#422006", "#fef08a"],
    ["#ddd6fe", "#4c1d95", "#2e1065", "#c4b5fd"],
    ["#fed7aa", "#7c2d12", "#431407", "#fed7aa"],
    ["#cffafe", "#164e63", "#083344", "#a5f3fc"],
];

export function chipTokens(index: number, isDark: boolean) {
    const [bgL, txL, bgD, txD] = CHIP_PALETTE[index % CHIP_PALETTE.length];
    return { background: isDark ? bgD : bgL, color: isDark ? txD : txL };
}