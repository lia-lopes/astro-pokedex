import {
  defineConfig,
  fontProviders,
} from "astro/config";
import icon from "astro-icon";
import tailwindcss from "@tailwindcss/vite";

type Response = {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    name: string;
    url: string;
  }[];
};

const resultPokemons: Response = await fetch(
  "https://pokeapi.co/api/v2/pokemon-species?limit=10000",
).then((response) => response.json());

const speciesNames = resultPokemons.results
  .map((species) => species.name)
  .filter(Boolean);

// https://astro.build/config
export default defineConfig({
  prefetch: true,
  site: "https://lia-lopes.github.io",
  base: "astro-pokedex",
  redirects: {
    ...Object.fromEntries(
      speciesNames.map((name, index) => [
        `/astro-pokedex/${index + 1}`,
        `/astro-pokedex/${name}/`,
      ]),
    ),
  },
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
  },
  build: {
    concurrency: 8
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [icon()],
});
