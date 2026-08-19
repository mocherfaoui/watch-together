import localFont from "next/font/local";

export const lucidaGrande = localFont({
  src: [
    { path: "./LucidaGrande.woff2", weight: "400", style: "normal" },
    { path: "./LucidaGrande-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-lucida-grande",
  display: "swap",
});
