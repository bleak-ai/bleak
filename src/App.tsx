import "./App.css";
import "./styles/animations.css";
import Landing from "./components/Landing";
import {SimpleInteractive} from "./components/SimpleInteractive";

function App() {
  return (
    <div className="dark min-h-screen bg-background py-8">
      {/* <SimpleInteractive /> */}
      <Landing />
    </div>
  );
}

export default App;
