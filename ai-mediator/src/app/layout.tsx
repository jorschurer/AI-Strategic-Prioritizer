import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Mediator - Stakeholder Alignment Tool",
  description: "Ein neutraler AI Agent führt 1:1 Gespräche mit Stakeholdern und erstellt Decision Memos für bessere Entscheidungen.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
