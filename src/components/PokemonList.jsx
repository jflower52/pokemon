import { useState, useEffect, useRef, useCallback } from "react";
import pokemonNameKr from "../data/pokemonNameKr.json";
import { typeKr, typeColors } from "../data/typeMap";
import PokemonModal from "./PokemonModal";

const text = {
  ko: {
    title: "포켓몬 리스트",
    searchPlaceholder: "한글 이름으로 검색 (예: 피카츄)",
    searchBtn: "검색",
    toggleBtn: "ENG",
  },
  en: {
    title: "Pokémon List",
    searchPlaceholder: "Search by English name (e.g. Pikachu)",
    searchBtn: "Search",
    toggleBtn: "KOR",
  },
};

function PokemonList() {
  const LIMIT = 30;
  const [pokemons, setPokemons] = useState([]);
  const [pokemonTypes, setPokemonTypes] = useState({});
  const [language, setLanguage] = useState("ko");
  const [searchMode, setSearchMode] = useState("ko");
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmedTerm, setConfirmedTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef(null);
  const [selectedPokemon, setSelectedPokemon] = useState(null);

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

  const getPokemonId = (url) => {
    const segments = url.split("/");
    return parseInt(segments[segments.length - 2], 10);
  };

  const toggleLanguage = () => {
    const nextLang = language === "ko" ? "en" : "ko";
    setLanguage(nextLang);
    setSearchMode(nextLang);
    setSearchTerm("");
    setConfirmedTerm("");
    setSuggestions([]);
    setActiveIndex(-1);
  };

  const handleChange = (e) => {
    const input = e.target.value;
    setSearchTerm(input);

    if (input === "") {
      setSuggestions([]);
      setActiveIndex(-1);
      return;
    }

    const filtered = pokemons.filter((p) => {
      const id = getPokemonId(p.url);
      if (id > 1025) return false;
      const eng = p.name.toLowerCase();
      const kor = (pokemonNameKr[id] || "").toLowerCase();
      const term = input.toLowerCase();
      return searchMode === "ko" ? kor.includes(term) : eng.includes(term);
    });

    setSuggestions(filtered.slice(0, 10));
    setActiveIndex(-1);
  };

  const confirmSearch = (englishName) => {
    const matched = pokemons.find((p) => p.name === englishName);
    const id = matched ? getPokemonId(matched.url) : null;
    const display = language === "ko" && id ? pokemonNameKr[id] : englishName;

    setConfirmedTerm(englishName);
    setSearchTerm(display);
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

  const filteredPokemons = pokemons
    .filter((pokemon) => {
      const id = getPokemonId(pokemon.url);
      return id <= 1025;
    })
    .filter((pokemon) => {
      const id = getPokemonId(pokemon.url);
      const eng = pokemon.name.toLowerCase();
      const kor = (pokemonNameKr[id] || "").toLowerCase();
      const term = confirmedTerm.toLowerCase();
      return eng.includes(term) || kor.includes(term);
    });

  return (
    <div className="p-4 relative">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold">{text[language].title}</h2>
        <button
          onClick={toggleLanguage}
          className="px-3 py-1 border rounded text-sm hover:bg-gray-100"
        >
          {text[language].toggleBtn}
        </button>
      </div>

      <div className="flex gap-2 mb-2">
        <input
          type="text"
          placeholder={text[language].searchPlaceholder}
          value={searchTerm}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <button
          onClick={() => confirmSearch(searchTerm)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {text[language].searchBtn}
        </button>
      </div>

      {suggestions.length > 0 && (
        <ul className="absolute bg-white border border-gray-300 w-full rounded z-10 max-h-60 overflow-y-auto">
          {suggestions.map((s, index) => {
            const id = getPokemonId(s.url);
            const display = language === "ko" ? pokemonNameKr[id] || s.name : s.name;
            return (
              <li
                key={s.name}
                className={`p-2 hover:bg-blue-100 cursor-pointer ${
                  index === activeIndex ? "bg-blue-100" : ""
                }`}
                onClick={() => confirmSearch(s.name)}
              >
                {display}
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
          const pngUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
          const imageUrl = id <= 649 ? gifUrl : pngUrl;
          const displayName = language === "ko" ? pokemonNameKr[id] || pokemon.name : pokemon.name;

          return (
            <li
              key={pokemon.name}
              onClick={() => setSelectedPokemon(pokemon.name)}
              className="bg-white rounded shadow p-4 hover:scale-105 transition-transform cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center text-center h-full">
                <img
                  src={imageUrl}
                  alt={pokemon.name}
                  className="w-20 h-20 object-contain mb-2 mx-auto"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = pngUrl;
                  }}
                />
                <p className="text-xs text-gray-500 mb-1">{number}</p>
                <p className="font-medium">{displayName}</p>
                <div className="flex justify-center gap-1 mt-2 flex-wrap">
                  {pokemonTypes[pokemon.name]?.map((type) => (
                    <span
                      key={type}
                      className={`text-xs px-2 py-1 rounded-full text-white ${
                        typeColors[type] || "bg-gray-400"
                      }`}
                    >
                      {language === "ko" ? typeKr[type] || type : type}
                    </span>
                  ))}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {selectedPokemon && (
        <PokemonModal
          name={selectedPokemon}
          language={language}
          onClose={() => setSelectedPokemon(null)}
        />
      )}

      <div ref={loader} className="h-10 mt-6 text-center text-gray-400">
        {hasMore ? "불러오는 중..." : "모든 포켓몬을 불러왔습니다"}
      </div>
    </div>
  );
}

export default PokemonList;
