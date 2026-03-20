import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
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
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100`}
            >

                {/* NAVBAR */}
                <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
                    <h1 className="font-bold text-lg">Sorteos501</h1>

                    <div className="flex gap-4">
                        <Link href="/">Inicio</Link>
                        <Link href="/boletos">Boletos</Link>
                        <Link href="/Avisos">Avisos</Link>
                        <Link href="/terminos">Términos</Link>
                    </div>
                </nav>

                {/* CONTENIDO */}
                <main>{children}</main>

            </body>
        </html>
    );
}