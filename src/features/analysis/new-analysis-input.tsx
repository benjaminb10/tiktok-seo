import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Button } from "#/components/ui/button";
import { InputGroup, InputGroupInput } from "#/components/ui/input-group";

type NewAnalysisInputProps = {
  placeholder?: string;
  className?: string;
};

export function NewAnalysisInput({
  placeholder = "Enter a TikTok username (@creator) or link",
  className = "",
}: NewAnalysisInputProps) {
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      navigate({ to: "/app", search: { input: input.trim() } });
    } else {
      navigate({ to: "/app" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <InputGroup className="h-14 text-base shadow-sm">
        <Search className="ml-4 h-5 w-5 text-muted-foreground" />
        <InputGroupInput
          aria-label="TikTok username or link"
          placeholder={placeholder}
          className="pl-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <div className="pr-2">
          <Button type="submit" className="h-10">
            Analyze
          </Button>
        </div>
      </InputGroup>
    </form>
  );
}
