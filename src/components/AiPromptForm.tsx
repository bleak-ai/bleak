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
    <div className="w-full max-w-3xl mx-auto p-6 bg-zinc-800 border border-zinc-800 rounded-2xl shadow-md space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          placeholder="Ask something..."
          className="bg-zinc-800 text-white border-zinc-700 placeholder-zinc-500"
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <div className="flex justify-end">
          <Button
            variant="default"
            className="border-zinc-600 text-white hover:bg-zinc-800"
          >
            Send
          </Button>
        </div>
      </form>

      {isError && (
        <div className="text-red-500 text-sm">
          Error: {(error as Error).message}
        </div>
      )}

      {data && (
        <div className="p-4 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 space-y-2">
          <p className="text-sm text-zinc-400">AI says:</p>
          <p className="font-medium">{data.answer}</p>
          {data.rating && (
            <p className="text-sm text-zinc-500">Rating: {data.rating}</p>
          )}
        </div>
      )}
    </div>
  );
};
