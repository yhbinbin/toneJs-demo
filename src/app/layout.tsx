import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "音频与ToneJS — Audio Demo",
  description: "A Next.js demo showcasing Tone.js audio library features",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className="antialiased">{children}</body>
    </html>
  );
}
