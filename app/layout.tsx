import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Corpse Beats - Pastel Horror Music Generator",
  description: "An exquisite corpse AI music generator that evolves from pastel aesthetics to horror",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-pastel-pink min-h-screen transition-colors duration-1000">
        {children}
      </body>
    </html>
  );
}
