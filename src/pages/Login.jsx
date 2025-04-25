import { useState } from "react";
import { auth } from "../utils/firebase-config";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("로그인 성공:", userCredential.user);
        navigate("/"); // 메인화면 이동
      })
      .catch((error) => {
        console.error("로그인 실패:", error);
      });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-100 to-blue-100">
      <form
        onSubmit={handleLogin}
        className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md text-center"
      >
        <h2 className="text-3xl font-bold mb-6 text-blue-600">포켓몬 도감 로그인</h2>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="w-full py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
        >
          로그인
        </button>
        <p className="mt-4 text-sm text-gray-500">
          아직 계정이 없나요?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            회원가입
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
