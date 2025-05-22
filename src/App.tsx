import {useState} from "react";
import "./App.css";
import {Button} from "./components/ui/button";
import {Textarea} from "./components/ui/textarea";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import axios from "axios";
import {AiPromptForm} from "./components/AiPromptForm";

function App() {
  return (
    <div className="dark min-h-screen flex items-center justify-center bg-background">
      <AiPromptForm />
    </div>
  );
}

export default App;
