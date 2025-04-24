import { signInWithEmailAndPassword } from "firebase/auth";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { auth } from "../utils/firebase-config";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  let navite = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    try {
      const userCredential = signInWithEmailAndPassword(auth, email, password);
      console.log("로그인 성공", userCredential.user);
      navite("/");
    } catch (error) {
      console.log("오류", error.message);
    }
    console.log(email, password);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">이메일</label>
        <input
          type="email"
          placeholder="이메일을 입력해주세요"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="password">비밀번호</label>
        <input
          type="password"
          placeholder="비밀번호를 입력해주세요"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button>로그인</button>
        <div>
          <span>계정이 없으신가요?</span>
          <Link to="/signup">
            <button>회원가입</button>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
