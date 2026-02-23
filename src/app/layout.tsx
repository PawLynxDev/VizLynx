import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist } from "next/font/google";
import { TRPCProvider } from "@/components/TRPCProvider";
import { Header } from "@/components/Header";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VizLynx - AI-Powered Marketing Studio",
  description: "Create stunning marketing content for e-commerce with AI. Product promotions, background removal, and brand management.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} font-sans antialiased`}>
          <TRPCProvider>
            <Header />
            {children}
            <Toaster position="bottom-right" richColors />
          </TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
