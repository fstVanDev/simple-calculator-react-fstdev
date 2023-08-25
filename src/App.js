import "./App.css";
import Calculator from "./components/Calculator";

function App() {
  return (
    <div className="App">
      <header>
        <h1 className="App-title">React Calculator</h1>
      </header>
      <main id="wrapper">
        <div id="calculator-wrapper">
          <Calculator />
        </div>
      </main>
      <footer>
        <p id="intro" className="App-intro">
          Built by fstDev
        </p>
      </footer>
    </div>
  );
}

export default App;
