import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leksik",
  applicationName: "Leksik",
  description: "Narrow responsive web client for account entry and dictionary viewing.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Leksik",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f3eb",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
