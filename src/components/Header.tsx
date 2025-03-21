import React from "react";
import { ThemeToggle } from "./ThemeToggler";

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="logo">
        <img src="/assets/logo.svg" alt="Logo" className="logo-image" />
        <h1 className="logo-text">MediaConv.</h1>
      </div>
      <ThemeToggle />
    </header>
  );
};

export default Header;
