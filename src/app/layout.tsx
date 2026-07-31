import type { Metadata, Viewport } from "next";
import "./globals.css";
import ThemeWrapper from "@/components/ui/ThemeWrapper";

export const metadata: Metadata = {
  title: "EYESHOME — Sécurité Domestique",
  description:
    "Système intelligent de sécurité domestique basé sur la technologie LoRaWAN",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "EYESHOME",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#232F3E",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=JSON.parse(localStorage.getItem("protecteur_theme")||'"dark"');document.documentElement.setAttribute("data-theme",t)}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#1A2332]">
        <ThemeWrapper>{children}</ThemeWrapper>
      </body>
    </html>
  );
}
