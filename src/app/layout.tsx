import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Store Web",
  description: "Creator commerce platform",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}