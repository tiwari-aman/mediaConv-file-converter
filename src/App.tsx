import React from "react";
import { UploadArea } from "./components/ImageConverter/UploadArea";
import Header from "./components/Header";
import "./styles/App.scss";

const App: React.FC = () => {
  return (
    <main className="main-container">
      <div className="container">
        <Header />

        <div className="heading-container">
          <h2 className="heading-title">
            Fast. Free. Unlimited. Convert Files with Ease!
          </h2>
          <p className="heading-description">
            Convert <span className="highlight">images, audio, and videos</span>{" "}
            to any format—completely{" "}
            <span className="highlight">free, unlimited, and secure</span>.
          </p>
        </div>
        <UploadArea />
      </div>
    </main>
  );
};

export default App;
