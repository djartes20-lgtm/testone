"use client";

import LoginButton from "../components/LoginButton";

export default function Login() {


  return (
    <div className="panel">
      <h2>Boas-Vindas ao Gotham Play!</h2>
      <LoginButton/> 

      <style jsx>{`
        .panel {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          padding: 20px;
          color: #ff0707;
        }
        input {
          padding: 10px;
          border-radius: 8px;
          border: 2px solid #ff0707;
          background: #000;
          color: #ff0707;
          width: 250px;
        }
        button {
          padding: 10px 20px;
          border-radius: 8px;
          border: 2px solid #ff0707;
          background: #000;
          color: #ff0707;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
