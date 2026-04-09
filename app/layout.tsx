import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taxes, Explained For Humans | 2024 Tax Guide",
  description:
    "Personalized, legally accurate tax guidance built from official IRS data. Understand brackets, deductions, credits, and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Literata:wght@400;600;700;800&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
