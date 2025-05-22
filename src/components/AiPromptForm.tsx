// src/components/AiPromptForm.tsx
import {useMutation} from "@tanstack/react-query";
import {sendPrompt} from "../api/sendPrompt";
import {useState} from "react";
import {Textarea} from "./ui/textarea";
import {Button} from "./ui/button";

export const AiPromptForm = () => {
  const [prompt, setPrompt] = useState("");

  const {
    mutate: send,
    data,
    isPending,
    isError,
    error
  } = useMutation({
    mutationFn: sendPrompt
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() !== "") {
      send(prompt);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded">
      <form onSubmit={handleSubmit}>
        <Textarea
          placeholder="Type your message here."
          className="w-full max-w-md"
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Button variant={"outline"}>Send</Button>
      </form>

      {isError && (
        <div className="text-red-600 mt-2">
          Error: {(error as Error).message}
        </div>
      )}

      {data && (
        <div className="mt-4 p-3 bg-gray-100 border rounded">
          <strong>AI says:</strong>
          <p>{data.answer}</p>
          <p>{data.rating}</p>
        </div>
      )}
    </div>
  );
};
