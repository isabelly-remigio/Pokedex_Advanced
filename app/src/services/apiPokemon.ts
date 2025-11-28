export async function pegarPokemons() {
  const resp = await fetch("https://pokeapi.co/api/v2/pokemon?limit=60");
  const data = await resp.json();

  const lista = await Promise.all(
    data.results.map(async (p) => {
      const d = await fetch(p.url).then((r) => r.json());
      return {
        id: d.id,
        nome: d.name,
        imagem: d.sprites.other["official-artwork"].front_default,
        tipos: d.types.map((t) => t.type.name),
      };
    })
  );

  return lista;
}

export async function pegarPokemonsPorTipo(tipo) {
  const resp = await fetch(`https://pokeapi.co/api/v2/type/${tipo}`);
  const data = await resp.json();

  const lista = await Promise.all(
    data.pokemon.slice(0, 60).map(async (p) => {
      const d = await fetch(p.pokemon.url).then((r) => r.json());
      return {
        id: d.id,
        nome: d.name,
        imagem: d.sprites.other["official-artwork"].front_default,
        tipos: d.types.map((t) => t.type.name),
      };
    })
  );

  return lista;
}
