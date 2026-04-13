import type { Metadata } from "next";
import { THEME_STORAGE_KEY } from "@/components/ThemeProvider";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Leksik Web Client",
  description: "Narrow responsive web client for account entry and dictionary viewing.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var storageKey = ${JSON.stringify(THEME_STORAGE_KEY)};
                  var storedTheme = window.localStorage.getItem(storageKey);
                  var theme = storedTheme === "dark" ? "dark" : "light";
                  document.documentElement.dataset.theme = theme;
                  document.documentElement.style.colorScheme = theme;
                } catch (error) {
                  document.documentElement.dataset.theme = "light";
                  document.documentElement.style.colorScheme = "light";
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
