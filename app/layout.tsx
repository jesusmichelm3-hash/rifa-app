import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
    title: "Sorteos501",
    description: "Gran rifa de $20,000 pesos",
    openGraph: {
        title: "Sorteos501",
        description: "Gran rifa de $20,000 pesos",
        url: "https://www.sorteos501.com",
        siteName: "Sorteos501",
        images: [
            {
                url: "/logo.jpeg",
                width: 1200,
                height: 630,
            },
        ],
        locale: "es_MX",
        type: "website",
    },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
