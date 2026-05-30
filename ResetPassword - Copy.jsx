const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { User } from "lucide-react";

export default function CharacterDetail() {
  const { id } = useParams();

  const { data: character, isLoading } = useQuery({
    queryKey: ["character", id],
    queryFn: () => db.entities.Character.get(id),
  });

  if (isLoading)
    return (
      <div className="p-8 text-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );

  if (!character) return <div className="p-8 text-center">Character not found</div>;

  return (
    <div>
      {character.image ? (
        <img src={character.image} alt={character.name} className="w-full h-64 object-cover" />
      ) : (
        <div className="w-full h-64 bg-muted flex items-center justify-center">
          <User className="h-16 w-16 text-muted-foreground" />
        </div>
      )}
      <div className="p-4 space-y-3">
        {character.role_in_story && (
          <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">
            {character.role_in_story}
          </span>
        )}
        <h1 className="text-2xl font-heading font-bold">{character.name}</h1>
        {character.bio && (
          <p className="text-foreground/80 leading-relaxed font-body">{character.bio}</p>
        )}
      </div>
    </div>
  );
}