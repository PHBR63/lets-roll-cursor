import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta baseada nas referências visuais
        background: {
          DEFAULT: "#1A0033",
          secondary: "#2D1B69",
        },
        card: {
          DEFAULT: "#2A2A3A",
          secondary: "#3A3A4A",
        },
        text: {
          DEFAULT: "#FFFFFF",
          secondary: "#B0B0B0",
        },
        accent: {
          DEFAULT: "#8000FF",
          light: "#C8BFE7",
        },
        // Barras de progresso
        life: "#EF4444", // Vermelho para Vida
        energy: "#22C55E", // Verde para Energia
        health: "#F59E0B", // Amarelo/Laranja para Saúde
        xp: "#8000FF", // Roxo para XP
        border: "#3A3A4A",
        input: "#2A2A3A",
        ring: "#8000FF",
        foreground: "#FFFFFF",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

