import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Journaly - Trade Journal",
  description: "Advanced trade journaling with Supabase and storage portability.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-50">
        {children}
      </body>
    </html>
  );
}
