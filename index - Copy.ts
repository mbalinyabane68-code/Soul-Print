const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

import ChapterCard from "../components/ChapterCard";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const containerRef = useRef(null);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = async (e) => {
    const delta = e.changedTouches[0].clientY - touchStartY.current;
    if (delta > 80 && containerRef.current?.scrollTop === 0) {
      setRefreshing(true);
      await queryClient.invalidateQueries({ queryKey: ["chapters-published"] });
      await queryClient.invalidateQueries({ queryKey: ["chapters-teaser"] });
      setRefreshing(false);
    }
  };

  const { data: chapters = [], isLoading } = useQuery({
    queryKey: ["chapters-published"],
    queryFn: () =>
      db.entities.Chapter.filter(
        { status: "published" },
        "-published_date",
        10
      ),
  });

  const { data: teasers = [] } = useQuery({
    queryKey: ["chapters-teaser"],
    queryFn: () =>
      db.entities.Chapter.filter(
        { status: "teaser" },
        "-created_date",
        5
      ),
  });

  if (isLoading)
    return (
      <div className="p-8 text-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );

  return (
    <div
      ref={containerRef}
      className="p-4 space-y-6"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {refreshing && (
        <div className="flex justify-center py-2">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div className="relative rounded-2xl overflow-hidden h-40 bg-primary">
        <img
          src="https://media.db.com/images/public/6a19b4b45440fb9647621469/4fcc7e53c_generated_image.png"
          alt=""
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <h2 className="text-2xl font-heading font-bold text-white">
            Latest Chapters
          </h2>
          <p className="text-white/60 text-sm mt-1">
            Feed Your Soul With Words
          </p>
        </div>
      </div>

      {chapters.length === 0 ? (
        <div className="text-center py-8">
          <img
            src="https://media.db.com/images/public/6a19b4b45440fb9647621469/23b5d0ce0_generated_image.png"
            alt=""
            className="w-32 h-32 mx-auto mb-3 opacity-60"
          />
          <p className="text-muted-foreground">
            No chapters yet. Stay tuned!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {chapters.map((ch) => (
            <ChapterCard key={ch.id} chapter={ch} />
          ))}
        </div>
      )}

      {teasers.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="font-heading font-semibold">Coming Soon</h3>
          </div>
          {teasers.map((t) => (
            <div
              key={t.id}
              className="bg-card border border-primary/20 rounded-xl p-4 mb-3"
            >
              <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full mb-2">
                Teaser
              </span>
              <h4 className="font-heading font-semibold text-foreground">
                Chapter {t.chapter_number}: {t.title}
              </h4>
              {t.teaser && (
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed italic">
                  "{t.teaser}"
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      <Link
        to="/writer"
        className="block bg-gradient-to-r from-primary to-primary/80 rounded-xl p-5 text-white active:scale-[0.98] transition-transform"
      >
        <p className="text-xs text-white/60 mb-1">Meet the Writer</p>
        <p className="font-semibold">
          Discover the soul behind the words →
        </p>
      </Link>
    </div>
  );
}