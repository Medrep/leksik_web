import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        token: {
          bg: "var(--bg)",
          bgAccent: "var(--bg-accent)",
          surface: "var(--surface)",
          surfaceStrong: "var(--surface-strong)",
          border: "var(--border)",
          text: "var(--text)",
          muted: "var(--text-muted)",
          brand: "var(--brand)",
          brandSoft: "var(--brand-soft)",
        },
      },
      boxShadow: {
        shell: "0 24px 60px rgba(64, 42, 18, 0.08)",
      },
      fontFamily: {
        serifDisplay: ['"Iowan Old Style"', '"Palatino Linotype"', '"Book Antiqua"', "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
