import { useState, useEffect, useRef, useCallback } from "react";
import { typeKr, typeColors } from "../data/typeMap";
import pokemonNameKr from "../data/pokemonNameKr.json";
import PokemonModal from "./PokemonModal";
import background from "../images/pokemon.gif";
import { Link } from "react-router-dom";

const text = {
  ko: {
    searchPlaceholder: "한글 이름으로 검색",
    searchBtn: "검색",
    toggleBtn: "ENG",
  },
  en: {
    searchPlaceholder: "Search by English name",
    searchBtn: "Search",
    toggleBtn: "KOR",
  },
};

function PokemonList({ user, handleLogout }) {
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

  const filteredPokemons = pokemons.filter((pokemon) => {
    const id = getPokemonId(pokemon.url);
    const eng = pokemon.name.toLowerCase();
    const kor = (pokemonNameKr[id] || "").toLowerCase();
    const term = confirmedTerm.toLowerCase();
    return eng.includes(term) || kor.includes(term);
  });
  return (
    <div className="relative">
      {/* 배경 이미지 */}
      <div className="h-130 w-full overflow-hidden relative">
        <img
          src={background}
          alt="Background"
          className="absolute top-0 left-0 w-full h-full object-cover"
        />

        {/* 로그인/로그아웃 버튼 */}
        <div className="absolute top-4 right-4 z-10">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700 bg-white px-2 py-1 rounded">{user.email}</span>
              <button
                onClick={handleLogout}
                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <Link to="/login">
              <button className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                로그인
              </button>
            </Link>
          )}
        </div>

        {/* 검색창 */}
        <div className="absolute inset-0 flex flex-col justify-center items-center">
          <div className="flex gap-2">
            {/* 검색창 + 자동완성 묶는 div */}
            <div className="relative w-72 md:w-[550px]">
              <input
                type="text"
                placeholder={text[language].searchPlaceholder}
                value={searchTerm}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="h-12 px-6 rounded-full border border-gray-300 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full text-lg bg-white"
              />

              {/* 자동완성 리스트 */}
              {suggestions.length > 0 && (
                <ul className="absolute left-0 right-0 bg-white border border-gray-300 rounded mt-2 shadow-lg max-h-60 overflow-y-auto z-10">
                  {suggestions.map((p, idx) => {
                    const id = getPokemonId(p.url);
                    const displayName = language === "ko" ? pokemonNameKr[id] || p.name : p.name;
                    return (
                      <li
                        key={p.name}
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                          idx === activeIndex ? "bg-gray-200" : ""
                        }`}
                        onClick={() => confirmSearch(p.name)}
                      >
                        {displayName}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* 검색 버튼 */}
            <button
              onClick={() => confirmSearch(searchTerm)}
              className="h-12 px-4 bg-blue-500 text-white rounded-full hover:bg-blue-600"
            >
              {text[language].searchBtn}
            </button>

            {/* 언어 전환 버튼 */}
            <button
              onClick={toggleLanguage}
              className="h-12 px-4 border rounded-full text-sm hover:bg-gray-100"
            >
              {text[language].toggleBtn}
            </button>
          </div>
        </div>
      </div>

      {/* 포켓몬 리스트 */}
      <div className="flex justify-center">
        <ul className="grid grid-cols-6 gap-6 px-4 py-8">
          {filteredPokemons.map((pokemon) => {
            const id = getPokemonId(pokemon.url);
            const number = `No. ${String(id).padStart(4, "0")}`;
            const gifUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
            const pngUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
            const imageUrl = id <= 649 ? gifUrl : pngUrl;
            const displayName =
              language === "ko" ? pokemonNameKr[id] || pokemon.name : pokemon.name;

            return (
              <li
                key={pokemon.name}
                onClick={() => setSelectedPokemon(pokemon.name)}
                className="w-56 h-80 bg-white/70 backdrop-blur-sm rounded-lg shadow-md hover:shadow-xl transition-shadow p-4 cursor-pointer"
              >
                <div className="flex flex-col items-center justify-center text-center h-full">
                  <img
                    src={imageUrl}
                    alt={pokemon.name}
                    className="w-28 h-28 object-contain mb-2 hover:scale-110 transition-transform"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = pngUrl;
                    }}
                  />
                  <p className="text-gray-500 text-sm mb-1">{number}</p>
                  <p className="font-semibold text-lg">{displayName}</p>
                  <div className="flex justify-center gap-1 mt-3 flex-wrap">
                    {pokemonTypes[pokemon.name]?.map((type) => (
                      <span
                        key={type}
                        className={`text-sm px-3 py-1 rounded-full text-white ${
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
      </div>

      {/* 모달 */}
      {selectedPokemon && (
        <PokemonModal
          name={selectedPokemon}
          language={language}
          onClose={() => setSelectedPokemon(null)}
        />
      )}

      {/* 무한 스크롤 */}
      <div ref={loader} className="h-10 mt-6 text-center text-gray-400">
        {hasMore ? "불러오는 중..." : "모든 포켓몬을 불러왔습니다"}
      </div>
    </div>
  );
}

export default PokemonList;
