'use client';

import { Inter, Roboto_Mono } from "next/font/google";
import { useEffect } from "react";
import "./globals.css";
import Link from "next/link";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Set dark mode based on system preference
  useEffect(() => {
    // Check if user prefers dark mode
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Apply dark mode class if system prefers dark
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Listen for changes in system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased dark:bg-gray-900`}
      >
        <header className="bg-slate-800 text-white shadow-md dark:bg-gray-950 dark:border-b dark:border-gray-800">
          <nav className="container mx-auto flex items-center justify-between p-4">
            <Link href="/" className="text-2xl font-bold">DnD Character Manager</Link>
            <div className="space-x-6">
              <Link href="/create" className="hover:underline">Create Character</Link>
              <Link href="/characters" className="hover:underline">View Characters</Link>
            </div>
          </nav>
        </header>
        <main className="container mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  );
}
