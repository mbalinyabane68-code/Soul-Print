const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { BarChart3, Check } from "lucide-react";

export default function PollSection({ poll }) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);

  const { data: votes = [] } = useQuery({
    queryKey: ["poll-votes", poll.id],
    queryFn: () => db.entities.PollVote.filter({ poll_id: poll.id }),
  });

  const totalVotes = votes.length;

  const submitVote = useMutation({
    mutationFn: (optionIndex) =>
      db.entities.PollVote.create({
        poll_id: poll.id,
        option_index: optionIndex,
      }),
    onSuccess: () => {
      setHasVoted(true);
      queryClient.invalidateQueries({ queryKey: ["poll-votes", poll.id] });
    },
  });

  const getCount = (idx) => votes.filter((v) => v.option_index === idx).length;
  const getPct = (idx) =>
    totalVotes > 0 ? Math.round((getCount(idx) / totalVotes) * 100) : 0;

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" />
        <h4 className="font-semibold text-sm">Reader Poll</h4>
      </div>
      <p className="text-sm font-medium">{poll.question}</p>

      <div className="space-y-2">
        {(poll.options || []).map((option, idx) => (
          <div key={idx}>
            {hasVoted ? (
              <div className="relative bg-muted rounded-lg overflow-hidden">
                <div
                  className="absolute inset-0 bg-primary/15 rounded-lg transition-all duration-500"
                  style={{ width: `${getPct(idx)}%` }}
                />
                <div className="relative px-3 py-2.5 flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {selected === idx && (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    )}
                    <span>{option}</span>
                  </div>
                  <span className="font-semibold text-primary">
                    {getPct(idx)}%
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setSelected(idx);
                  submitVote.mutate(idx);
                }}
                className="w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all hover:border-primary/50 hover:bg-primary/5 border-border active:scale-[0.98]"
              >
                {option}
              </button>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        {totalVotes} vote{totalVotes !== 1 ? "s" : ""} • Anonymous
      </p>
    </div>
  );
}