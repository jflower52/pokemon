import { useEffect, useState } from "react";
/* Firebase */
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./utils/firebase-config";
/* 포켓몬 리스트 컴포넌트 */
import PokemonList from "./components/PokemonList";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <div>
      <PokemonList user={user} handleLogout={handleLogout} />
    </div>
  );
}

export default App;
