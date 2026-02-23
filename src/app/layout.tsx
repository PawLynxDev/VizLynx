import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist } from "next/font/google";
import { TRPCProvider } from "@/components/TRPCProvider";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PixelForge",
  description: "AI-powered marketing content studio for e-commerce",
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
            {children}
            <Toaster position="bottom-right" richColors />
          </TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
