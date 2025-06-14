import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rent-A-Ferri",
  description: "Book your next adventure in the final frontier",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-black text-white`}>
        <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
          {children}
        </main>
      </body>
    </html>
  );
}
