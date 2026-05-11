import { defineConfig, fontProviders } from "astro/config";
import icon from "astro-icon";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  prefetch: true,
  site: "https://lia-lopes.github.io",
  base: "astro-pokedex",
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Nunito",
      cssVariable: "--font-nunito",
      weights: [400, 700],
    },
  ],
  experimental: {
    clientPrerender: true,
    queuedRendering: {
      enabled: true,
    },
  },
  image: {
    domains: ["raw.githubusercontent.com"],
    responsiveStyles: true,
    service: {
      entrypoint: "src/lib/imageService.ts",
    }
  },
  build: {
    concurrency: 8,
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [icon({
    include: {
      "mdi": ["menu-left-outline", "menu-right-outline"],
    }
  })],
});
