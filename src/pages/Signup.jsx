import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router";
import { useState } from "react";
import { auth } from "../utils/firebase-config";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  let navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmpassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("회원가입 성공", userCredential.user);
      navigate("/");
    } catch (error) {
      console.log("회원가입 오류", error.message);
    }
  };

  return (
    <div>
      <h2>회원가입</h2>
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
          id="password"
          placeholder="비밀번호는 6자리 이상입니다"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label htmlFor="confirmPassword">비밀번호 확인</label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmpassword}
          onChange={(e) => setConfirmpassword(e.target.value)}
        />
        <button type="submit">회원가입</button>
      </form>
    </div>
  );
}

export default Signup;
