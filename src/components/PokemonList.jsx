import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import pokemonNameKr from "../data/pokemonNameKr.json"; // ✅ 한글 이름 JSON import

function PokemonList() {
  const [pokemons, setPokemons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmedTerm, setConfirmedTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [pokemonTypes, setPokemonTypes] = useState({});

  const typeKr = {
    normal: "노말",
    fire: "불꽃",
    water: "물",
    electric: "전기",
    grass: "풀",
    ice: "얼음",
    fighting: "격투",
    poison: "독",
    ground: "땅",
    flying: "비행",
    psychic: "에스퍼",
    bug: "벌레",
    rock: "바위",
    ghost: "고스트",
    dragon: "드래곤",
    dark: "악",
    steel: "강철",
    fairy: "페어리",
  };

  useEffect(() => {
    fetch("https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0")
      .then((res) => res.json())
      .then((data) => {
        setPokemons(data.results);

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
          const typeMap = {};
          typeData.forEach((p) => {
            typeMap[p.name] = p.types;
          });
          setPokemonTypes(typeMap);
        });
      })
      .catch((err) => console.error("포켓몬 데이터를 불러오는 중 오류 발생:", err));
  }, []);

  const getPokemonId = (url) => {
    const segments = url.split("/");
    return parseInt(segments[segments.length - 2], 10);
  };

  const handleChange = (e) => {
    const input = e.target.value;
    setSearchTerm(input);
    if (input === "") {
      setSuggestions([]);
      setActiveIndex(-1);
    } else {
      const filtered = pokemons.filter((p) => p.name.toLowerCase().includes(input.toLowerCase()));
      setSuggestions(filtered.slice(0, 10));
      setActiveIndex(-1);
    }
  };

  const confirmSearch = (value) => {
    setConfirmedTerm(value);
    setSearchTerm(value);
    setSuggestions([]);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      setActiveIndex((prev) => (prev === 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0) {
        confirmSearch(suggestions[activeIndex].name);
      } else {
        confirmSearch(searchTerm);
      }
    }
  };

  const filteredPokemons = pokemons.filter((pokemon) =>
    pokemon.name.toLowerCase().includes(confirmedTerm.toLowerCase())
  );

  const typeColors = {
    fire: "bg-red-500",
    water: "bg-blue-500",
    grass: "bg-green-500",
    electric: "bg-yellow-400 text-black",
    bug: "bg-lime-500",
    normal: "bg-gray-400",
    poison: "bg-purple-500",
    ground: "bg-yellow-700",
    fairy: "bg-pink-400",
    fighting: "bg-orange-600",
    psychic: "bg-pink-600",
    rock: "bg-yellow-600",
    ghost: "bg-indigo-600",
    ice: "bg-cyan-400",
    dragon: "bg-purple-700",
    dark: "bg-gray-800 text-white",
    steel: "bg-gray-500",
    flying: "bg-sky-300 text-black",
  };

  return (
    <div className="p-4 relative">
      <h2 className="mb-4 text-xl font-semibold">포켓몬 리스트</h2>

      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder="포켓몬 이름 검색"
          value={searchTerm}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <button
          onClick={() => confirmSearch(searchTerm)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          검색
        </button>
      </div>

      {suggestions.length > 0 && (
        <ul className="absolute bg-white border border-gray-300 w-full rounded z-10 max-h-60 overflow-y-auto">
          {suggestions.map((s, index) => {
            const id = getPokemonId(s.url);
            return (
              <li
                key={s.name}
                className={`p-2 hover:bg-blue-100 cursor-pointer ${
                  index === activeIndex ? "bg-blue-100" : ""
                }`}
                onClick={() => confirmSearch(s.name)}
              >
                {pokemonNameKr[id] || s.name}
              </li>
            );
          })}
        </ul>
      )}

      <ul className="grid grid-cols-6 gap-4 mt-6">
        {filteredPokemons.map((pokemon) => {
          const id = getPokemonId(pokemon.url);
          const number = `No. ${String(id).padStart(4, "0")}`;
          const gifUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
          const basicPngUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
          const imageUrl = id <= 649 ? gifUrl : basicPngUrl;

          return (
            <li
              key={pokemon.name}
              className="bg-white rounded shadow p-4 hover:scale-105 transition-transform"
            >
              <Link
                to={`/pokemon/${pokemon.name}`}
                className="flex flex-col items-center justify-center text-center h-full"
              >
                <img
                  src={imageUrl}
                  alt={pokemon.name}
                  className="w-20 h-20 object-contain mb-2 mx-auto"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = basicPngUrl;
                  }}
                />
                <p className="text-xs text-gray-500 mb-1">{number}</p>
                <p className="font-medium">{pokemonNameKr[id] || pokemon.name}</p>
                <div className="flex justify-center gap-1 mt-2 flex-wrap">
                  {pokemonTypes[pokemon.name]?.map((type) => (
                    <span
                      key={type}
                      className={`text-xs px-2 py-1 rounded-full text-white ${
                        typeColors[type] || "bg-gray-300"
                      }`}
                    >
                      {typeKr[type] || type}
                    </span>
                  ))}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default PokemonList;
