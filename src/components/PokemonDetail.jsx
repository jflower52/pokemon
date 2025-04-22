import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function PokemonDetail() {
  const { name } = useParams(); // URL에서 포켓몬 이름 추출
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState(null);

  useEffect(() => {
    fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
      .then((res) => res.json())
      .then((data) => setPokemon(data))
      .catch((err) => console.error("포켓몬 상세 정보 오류:", err));
  }, [name]);

  if (!pokemon) {
    return <div className="p-4">로딩 중...</div>;
  }

  return (
    <div className="p-4">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        돌아가기
      </button>

      <div className="flex flex-col items-center gap-4">
        <h2 className="text-2xl font-bold capitalize">{pokemon.name}</h2>
        <img
          src={pokemon.sprites.other["official-artwork"].front_default}
          alt={pokemon.name}
          className="w-40 h-40 object-contain"
        />
        <div className="text-center">
          <p>타입: {pokemon.types.map((t) => t.type.name).join(", ")}</p>
          <p>키: {pokemon.height / 10} m</p>
          <p>몸무게: {pokemon.weight / 10} kg</p>
        </div>
      </div>
    </div>
  );
}

export default PokemonDetail;
