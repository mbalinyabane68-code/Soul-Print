const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useQuery } from "@tanstack/react-query";

import ChapterCard from "../components/ChapterCard";

export default function Archives() {
  const { data: chapters = [], isLoading } = useQuery({
    queryKey: ["chapters-archive"],
    queryFn: () =>
      db.entities.Chapter.filter(
        { status: "published" },
        "chapter_number",
        100
      ),
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
        <h2 className="text-xl font-heading font-bold">Chapter Archives</h2>
        <p className="text-sm text-muted-foreground">
          All chapters in reading order
        </p>
      </div>
      {chapters.length === 0 ? (
        <div className="text-center py-12">
          <img
            src="https://media.db.com/images/public/6a19b4b45440fb9647621469/23b5d0ce0_generated_image.png"
            alt=""
            className="w-24 h-24 mx-auto mb-3 opacity-50"
          />
          <p className="text-muted-foreground">
            No chapters published yet. Check back soon!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {chapters.map((ch) => (
            <ChapterCard key={ch.id} chapter={ch} />
          ))}
        </div>
      )}
    </div>
  );
}