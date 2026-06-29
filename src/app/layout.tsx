import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { WhatsAppFab } from "@/components/nav/whatsapp-fab";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-code",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "ManiaPremios | Premios Extraordinarios",
  description:
    "Participa en los sorteos exclusivos de ManiaPremios. Compra tus tickets y gana premios extraordinarios con mecánica totalmente transparente.",
  icons: {
    icon: "/logomaniapremios.png",
    apple: "/logomaniapremios.png",
  },
  openGraph: {
    title: "ManiaPremios",
    description: "Premios extraordinarios. Mecánica transparente.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground noise-bg">
        {children}
        <Toaster />
        <WhatsAppFab />
      </body>
    </html>
  );
}
