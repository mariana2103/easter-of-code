import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Easter of code",
  description: "College hackathon challenge platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-[#0a0a0a] text-zinc-200">
        {children}
      </body>
    </html>
  );
}
