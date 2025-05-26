import "./App.css";
import "./styles/animations.css";
import Landing from "./components/Landing";
import Bleak from "./components/bleak";

function App() {
  return (
    <div className="dark">
      <Bleak />
      <Landing />
    </div>
  );
}

export default App;
