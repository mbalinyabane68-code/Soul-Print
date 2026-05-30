const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useQuery } from "@tanstack/react-query";

import { Link } from "react-router-dom";
import { User } from "lucide-react";

export default function Characters() {
  const { data: characters = [], isLoading } = useQuery({
    queryKey: ["characters"],
    queryFn: () => db.entities.Character.list('created_date', 50),
  });

  if (isLoading)
    return (
      <div className="p-8 text-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-xl font-heading font-bold">Characters</h2>
        <p className="text-sm text-muted-foreground">Meet the cast</p>
      </div>
      {characters.length === 0 ? (
        <div className="text-center py-12">
          <User className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            Characters will appear here as the story unfolds.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {characters.map((c) => (
            <Link
              key={c.id}
              to={`/character/${c.id}`}
              className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-all active:scale-[0.98]"
            >
              {c.image ? (
                <img
                  src={c.image}
                  alt={c.name}
                  className="w-full h-36 object-contain bg-muted/30"
                />
              ) : (
                <div className="w-full h-36 bg-muted flex items-center justify-center">
                  <User className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              <div className="p-3">
                <h3 className="font-semibold text-sm">{c.name}</h3>
                {c.role_in_story && (
                  <p className="text-xs text-primary mt-0.5">
                    {c.role_in_story}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}