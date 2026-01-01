import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SmoothProvider from "@/components/SmoothScroll";
import ParticlesBackground from "@/components/ParticlesBackground";
import { Toaster } from "react-hot-toast";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: 'Motoronics - Find & Sell Your Dream Vehicle',
  description: 'Pakistan\'s largest automotive marketplace for buying and selling vehicles.',
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
  <SmoothProvider>
          <ParticlesBackground />          
          <Header />
                <Toaster />
        {children}
          <Footer />
        </SmoothProvider>
      </body>
    </html>
  );
}
