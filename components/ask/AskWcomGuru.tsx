"use client";

import { useEffect, useState } from "react";
import { marked } from "marked";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ParseHTML from "@/components/global/ParseHTML";
import { CheckCheckIcon } from "lucide-react";

const AskWcomGuru = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [renderedAnswer, setRenderedAnswer] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }
    setError(null);
    setIsLoading(true);
    setAnswer("");

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get an answer.");
      }

      const data = await response.json();
      setAnswer(data.answer ?? "I couldn't find an answer.");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
  
    if (!answer) {
      setRenderedAnswer("");
      return () => {
        isMounted = false;
      };
    }
  
    (async () => {
      try {
        const html = await marked.parse(answer, { breaks: true }) as string;
        if (isMounted) setRenderedAnswer(html || "");
      } catch {
        if (isMounted) setRenderedAnswer("");
      }
    })();
  
    return () => {
      isMounted = false;
    };
  }, [answer]);
  

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="h1-bold text-dark100_light900">Ask WcomGuru</h1>
        <p className="text-dark400_light700 mt-2">
          Describe your question and our Gemini-powered assistant will respond right away.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="paragraph-semibold text-dark400_light800" htmlFor="wcomQuestion">
          Your Question
        </label>
        <Textarea
          id="wcomQuestion"
          placeholder="Ask anything about coding, debugging, best practices..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={6}
          className="paragraph-regular background-light900_dark300 text-dark300_light700 border light-border-2 rounded-lg"
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="primary-gradient w-full sm:w-fit !text-light-900"
        >
          {isLoading ? "Thinking..." : "Ask WcomGuru"}
        </Button>
      </form>
      {error && (
        <div className="rounded-lg border border-red-500 bg-red-50/10 p-4 text-red-500">
          {error}
        </div>
      )}
      {answer && (
        <div className="rounded-lg border light-border-2 background-light900_dark300 p-4">
          <p className="paragraph-semibold text-dark400_light800 mb-2">Answer</p>
          <ParseHTML explanation={renderedAnswer} />
        </div>
      )}
    </div>
  );
};

export default AskWcomGuru;

