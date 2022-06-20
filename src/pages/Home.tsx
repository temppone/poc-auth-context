import { TextField } from "@mui/material";
import React, { FormEvent, useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

const Home = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, isAuthenticated } = useContext(AuthContext);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const data = {
      email,
      password,
    };

    await signIn(data);
  };

  return (
    <div>
      <form className="App" onSubmit={handleSubmit}>
        <TextField
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
        <TextField
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />

        <button type="submit">Entrar</button>
      </form>
    </div>
  );
};

export default Home;
