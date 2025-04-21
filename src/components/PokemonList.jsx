import { useState, useEffect } from "react";

function PokemonList() {
  const [pokemons, setPokemons] = useState([]);

  // 컴포넌트가 처음 렌더링될 때 포켓몬 리스트를 불러옴
  useEffect(() => {
    fetch("https://pokeapi.co/api/v2/pokemon?limit=42&offset=0")
      .then((res) => res.json())
      .then((data) => {
        setPokemons(data.results); // 불러온 포켓몬 리스트 저장
      })
      .catch((err) => {
        console.error("포켓몬 데이터를 불러오는 중 오류 발생:", err);
      });
  }, []);

  // URL에서 포켓몬 ID 추출
  const getPokemonId = (url) => {
    const segments = url.split("/");
    return parseInt(segments[segments.length - 2], 10);
  };

  return (
    <div className="p-4">
      <h2 className="mb-4 text-xl font-semibold">포켓몬 리스트</h2>
      <ul className="grid grid-cols-6 gap-4">
        {pokemons.map((pokemon) => {
          const id = getPokemonId(pokemon.url);

          // 1~649번: 움직이는 GIF 이미지
          const gifUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;

          // 모든 포켓몬이 공통으로 fallback할 기본 PNG 이미지 (도트 스타일)
          const basicPngUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

          // 1~649는 GIF, 그 외는 PNG
          const imageUrl = id <= 649 ? gifUrl : basicPngUrl;

          return (
            <li
              key={pokemon.name}
              className="flex flex-col items-center justify-center bg-white rounded shadow p-4 capitalize hover:scale-105 transition-transform"
            >
              <img
                src={imageUrl}
                alt={pokemon.name}
                className="w-20 h-20 object-contain mb-2"
                // GIF가 깨질 경우 기본 PNG로 fallback
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = basicPngUrl;
                }}
              />
              <p className="text-center">{pokemon.name}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default PokemonList;
