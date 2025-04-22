import { useEffect, useState } from "react";
import pokemonNameKr from "../data/pokemonNameKr.json";
import { typeKr, typeColors } from "../data/typeMap";

function PokemonModal({ name, onClose, language }) {
  const [pokemon, setPokemon] = useState(null);
  const [species, setSpecies] = useState(null);

  useEffect(() => {
    fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
      .then((res) => res.json())
      .then((data) => setPokemon(data));

    fetch(`https://pokeapi.co/api/v2/pokemon-species/${name}`)
      .then((res) => res.json())
      .then((data) => setSpecies(data));
  }, [name]);

  if (!pokemon || !species) return null;

  const id = pokemon.id;
  const number = `No. ${String(id).padStart(4, "0")}`;
  const displayName = language === "ko" ? pokemonNameKr[id] || name : name;

  const gifUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`;
  const pngUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
  const imageUrl = id <= 649 ? gifUrl : pngUrl;

  const flavorText =
    species.flavor_text_entries
      .find((entry) => entry.language.name === (language === "ko" ? "ko" : "en"))
      ?.flavor_text.replace(/\f/g, " ") || "정보 없음";

  const height = (pokemon.height / 10).toFixed(1);
  const weight = (pokemon.weight / 10).toFixed(1);

  const category =
    species.genera.find((g) => g.language.name === (language === "ko" ? "ko" : "en"))?.genus || "";

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
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

        <div className="flex justify-center mb-4">
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

        {/* 설명 */}
        <p className="mt-4 text-sm italic text-gray-600">{flavorText}</p>

        {/* 기본 정보 */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <p className="font-semibold">{language === "ko" ? "키" : "Height"}</p>
            <p>{height} m</p>
          </div>
          <div>
            <p className="font-semibold">{language === "ko" ? "몸무게" : "Weight"}</p>
            <p>{weight} kg</p>
          </div>
          <div>
            <p className="font-semibold">{language === "ko" ? "분류" : "Category"}</p>
            <p>{category}</p>
          </div>
          <div>
            <p className="font-semibold">{language === "ko" ? "타입" : "Type"}</p>
            <div className="flex justify-center gap-1 flex-wrap mt-1">
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
        </div>
      </div>
    </div>
  );
}

export default PokemonModal;
