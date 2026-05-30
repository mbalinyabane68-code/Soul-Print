const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/lib/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Bookmark, ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

function BookmarkItem({ bookmark }) {
  const { data: chapter } = useQuery({
    queryKey: ["chapter", bookmark.chapter_id],
    queryFn: () => db.entities.Chapter.get(bookmark.chapter_id),
    enabled: !!bookmark.chapter_id,
  });

  return (
    <Link
      to={`/chapter/${bookmark.chapter_id}`}
      className="block bg-card border border-border rounded-xl p-4 hover:bg-muted/50 active:scale-[0.98] transition-all"
    >
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 rounded-full p-2">
          <BookOpen className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm truncate">
            {chapter ? `Chapter ${chapter.chapter_number}: ${chapter.title}` : "Loading..."}
          </p>
        </div>
        <Bookmark className="h-4 w-4 text-primary flex-shrink-0 fill-primary" />
      </div>
    </Link>
  );
}

export default function Bookmarks() {
  const { user } = useAuth();

  const { data: bookmarks = [], isLoading } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: () =>
      db.entities.Bookmark.filter(
        { created_by: user?.email },
        "-created_date",
        50
      ),
    enabled: !!user,
  });

  return (
    <div>
      <div className="px-4 pt-3 pb-1">
        <h2 className="font-heading font-semibold">Bookmarks</h2>
      </div>
      <div className="p-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium text-muted-foreground">No bookmarks yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Save chapters to read later
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {bookmarks.map((b) => (
              <BookmarkItem key={b.id} bookmark={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}