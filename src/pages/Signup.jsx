import { useState } from "react";
import { auth } from "../utils/firebase-config";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("회원가입 성공:", userCredential.user);
        navigate("/"); // 메인화면 이동
      })
      .catch((error) => {
        console.error("회원가입 실패:", error);
      });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-100 to-blue-100">
      <form
        onSubmit={handleSignup}
        className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md text-center"
      >
        <h2 className="text-3xl font-bold mb-6 text-blue-600">포켓몬 도감 회원가입</h2>
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
          className="w-full py-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
        >
          회원가입
        </button>
        <p className="mt-4 text-sm text-gray-500">
          이미 계정이 있나요?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            로그인
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;
