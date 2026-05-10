import type { GetImageResult } from "astro";
import { getImage } from "astro:assets";

export const colorMap = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
} as const;

export type PokemonType = keyof typeof colorMap;

export type Species = {
  name: string;
  id: number;
  pokemons: Pokemon[];
};

export type Pokemon = {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: Type[];
  abilities: Ability[];
  sprites: [
    {
      sprites: string | null;
    },
  ];
  image?: GetImageResult;
};

export type Type = {
  type: {
    name: PokemonType;
  };
};

export type Ability = {
  ability: {
    name: string;
  };
  is_hidden: boolean;
};

type QueryResult = {
  pokemonspecies: Species[];
};

const substituteSprite =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/substitute.png";

const query = `
query getPokemon {
  pokemonspecies(order_by: {id: asc}) {
    name
    id
    pokemons {
      id
      name
      height
      weight
      types: pokemontypes {
        type {
          name
        }
      }
      abilities: pokemonabilities {
        ability {
          name
        }
        is_hidden
      }
      sprites: pokemonsprites {
        sprites(path: "front_default")
      }
    }
  }
}
`;

console.log("Loading substitute image...");

export const substitute = await getImage({
  src: substituteSprite,
  width: 96,
  height: 96,
  format: "png",
  quality: "high",
});

console.log("Substitute image loaded.");

console.log("Fetching...");
console.time("fetch-poke");

export const {
  data: { pokemonspecies: pokemons },
} = await fetch("https://graphql.pokeapi.co/v1beta2", {
  method: "POST",
  body: JSON.stringify({ query }),
})
  .then((pokemon) => pokemon.json() as Promise<{ data: QueryResult }>)
  .then(async (pokemons) => {
    const promises = [];

    for (const species of pokemons.data.pokemonspecies) {
      for (const pokemon of species.pokemons) {
        const sprite = pokemon.sprites[0]?.sprites ?? undefined;

        if (!sprite) {
          continue;
        }

        promises.push(
          getImage({
            src: sprite,
            quality: "high",
            format: "png",
            height: 96,
            width: 96,
          }).then((image) => {
            pokemon.image = image;
          }),
        );
      }
    }

    await Promise.all(promises);
    return pokemons;
  });

console.timeEnd("fetch-poke");
