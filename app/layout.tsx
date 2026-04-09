import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Taxes, Explained For Humans | 2025 Tax Guide",
  description:
    "Personalized, legally accurate tax guidance built from official IRS data. Understand brackets, deductions, credits, and more.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Tax Guide",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0C1018",
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
      <body className="font-sans safe-bottom">{children}</body>
    </html>
  );
}
