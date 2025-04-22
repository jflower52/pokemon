import { useEffect, useState } from "react";
import pokemonNameKr from "../data/pokemonNameKr.json";
import { typeKr, typeColors } from "../data/typeMap";

const textMap = {
  ko: {
    types: "타입",
    stats: "기본 능력치",
    statNames: {
      hp: "HP",
      attack: "공격",
      defense: "방어",
      "special-attack": "특수공격",
      "special-defense": "특수방어",
      speed: "스피드",
    },
  },
  en: {
    types: "Type",
    stats: "Base Stats",
    statNames: {
      hp: "HP",
      attack: "Attack",
      defense: "Defense",
      "special-attack": "Sp. Atk",
      "special-defense": "Sp. Def",
      speed: "Speed",
    },
  },
};

function PokemonModal({ name, onClose, language }) {
  const [pokemon, setPokemon] = useState(null);

  useEffect(() => {
    fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
      .then((res) => res.json())
      .then((data) => setPokemon(data));
  }, [name]);

  if (!pokemon) return null;

  const id = pokemon.id;
  const number = `No. ${String(id).padStart(4, "0")}`;
  const displayName = language === "ko" ? pokemonNameKr[id] || name : name;
  const gifUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
  const pngUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  const imageUrl = id <= 649 ? gifUrl : pngUrl;
  const uiText = textMap[language];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-[90%] max-w-md relative text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-black text-lg"
        >
          ×
        </button>

        <div className="flex justify-center mb-2">
          <img
            src={imageUrl}
            alt={name}
            className="w-32 h-32 object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = pngUrl;
            }}
          />
        </div>

        <h2 className="text-xl font-bold">{displayName}</h2>
        <p className="text-sm text-gray-500">{number}</p>

        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-1">{uiText.types}</h3>
          <div className="flex justify-center gap-2 flex-wrap">
            {pokemon.types.map((t) => (
              <span
                key={t.type.name}
                className={`text-xs px-2 py-1 rounded-full text-white ${
                  typeColors[t.type.name] || "bg-gray-400"
                }`}
              >
                {language === "ko" ? typeKr[t.type.name] || t.type.name : t.type.name}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-1">{uiText.stats}</h3>
          <ul className="text-sm space-y-1">
            {pokemon.stats.map((s) => (
              <li key={s.stat.name}>
                {uiText.statNames[s.stat.name] || s.stat.name}: {s.base_stat}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PokemonModal;
