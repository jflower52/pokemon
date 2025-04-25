export const getPokemonId = (url) => {
  const segments = url.split("/");
  return parseInt(segments[segments.length - 2], 10);
};

export const getImageUrl = (id) => {
  return id <= 649
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${id}.gif`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
};
