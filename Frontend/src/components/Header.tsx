import React from "react";

const Header: React.FC = () => {
  return (
    <header style={{ padding: "20px", backgroundColor: "#333", color: "#fff", textAlign: "center" }}>
      <h1>Task Management System</h1>
      <nav>
        <a href="/" style={{ color: "#fff", margin: "0 10px" }}>Home</a>
      </nav>
    </header>
  );
};

export default Header;
