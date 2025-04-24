import { useState, useEffect, useRef, useCallback } from "react";

export function usePokemons(LIMIT = 30) {
  const [pokemons, setPokemons] = useState([]);
  const [pokemonTypes, setPokemonTypes] = useState({});
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef(null);

  const fetchPokemons = useCallback(() => {
    if (!hasMore || offset >= 1025) return;

    fetch(`https://pokeapi.co/api/v2/pokemon?limit=${LIMIT}&offset=${offset}`)
      .then((res) => res.json())
      .then((data) => {
        setPokemons((prev) => [...prev, ...data.results]);
        setOffset((prev) => prev + LIMIT);
        if (offset + LIMIT >= 1025) setHasMore(false);

        Promise.all(
          data.results.map((p) =>
            fetch(`https://pokeapi.co/api/v2/pokemon/${p.name}`)
              .then((res) => res.json())
              .then((detail) => ({
                name: p.name,
                types: detail.types.map((t) => t.type.name),
              }))
          )
        ).then((typeData) => {
          setPokemonTypes((prev) => {
            const newMap = { ...prev };
            typeData.forEach((p) => {
              newMap[p.name] = p.types;
            });
            return newMap;
          });
        });
      });
  }, [offset, hasMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchPokemons();
        }
      },
      { threshold: 1 }
    );
    if (loader.current) observer.observe(loader.current);
    return () => observer.disconnect();
  }, [fetchPokemons, hasMore]);

  return { pokemons, pokemonTypes, hasMore, loader };
}
