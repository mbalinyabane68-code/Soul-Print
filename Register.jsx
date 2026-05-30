const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/lib/AuthContext";
import { Heart, Bookmark, Share2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import CommentSection from "../components/CommentSection";
import PollSection from "../components/PollSection";
import ShareModal from "../components/ShareModal";

export default function ChapterDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showShare, setShowShare] = useState(false);

  const { data: chapter, isLoading } = useQuery({
    queryKey: ["chapter", id],
    queryFn: () => db.entities.Chapter.get(id),
  });

  const { data: likes = [] } = useQuery({
    queryKey: ["chapter-likes", id],
    queryFn: () => db.entities.ChapterLike.filter({ chapter_id: id }),
  });

  const { data: bookmarks = [] } = useQuery({
    queryKey: ["bookmark-check", id],
    queryFn: () =>
      db.entities.Bookmark.filter({
        chapter_id: id,
        created_by: user?.email,
      }),
    enabled: !!user,
  });

  const { data: polls = [] } = useQuery({
    queryKey: ["polls", id],
    queryFn: () => db.entities.Poll.filter({ chapter_id: id }),
  });

  const isLiked = likes.some((l) => l.created_by === user?.email);
  const isBookmarked = bookmarks.length > 0;

  const addLike = useMutation({
    mutationFn: async () => {
      await db.entities.ChapterLike.create({
        chapter_id: id,
        user_email: user?.email,
      });
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["chapter-likes", id] });
      const prev = queryClient.getQueryData(["chapter-likes", id]);
      queryClient.setQueryData(["chapter-likes", id], (old = []) => [
        ...old,
        { id: "optimistic", chapter_id: id, created_by: user?.email },
      ]);
      return { prev };
    },
    onError: (_err, _v, ctx) =>
      queryClient.setQueryData(["chapter-likes", id], ctx?.prev),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["chapter-likes", id] }),
  });

  const toggleBookmark = useMutation({
    mutationFn: async () => {
      if (isBookmarked) {
        await db.entities.Bookmark.delete(bookmarks[0].id);
      } else {
        await db.entities.Bookmark.create({
          chapter_id: id,
          user_email: user?.email,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmark-check", id] });
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });

  if (isLoading)
    return (
      <div className="p-8 text-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );

  if (!chapter)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Chapter not found
      </div>
    );

  return (
    <div className="pb-8">
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <span className="text-sm font-semibold text-primary">
          Chapter {chapter.chapter_number}
        </span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleBookmark.mutate()}
          >
            <Bookmark
              className={`h-5 w-5 ${
                isBookmarked ? "fill-primary text-primary" : ""
              }`}
            />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowShare(true)}
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {chapter.cover_image && (
        <img
          src={chapter.cover_image}
          alt=""
          className="w-full h-48 object-cover"
        />
      )}

      <div className="p-4 space-y-6">
        <div>
          <h1 className="text-2xl font-heading font-bold mb-2">
            {chapter.title}
          </h1>
        </div>

        <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed whitespace-pre-wrap font-body">
          {chapter.content}
        </div>

        <div className="flex items-center gap-4 py-3 border-t border-border">
          <button
            onClick={() => !isLiked && addLike.mutate()}
            disabled={isLiked || addLike.isPending}
            className={`flex items-center gap-1.5 text-sm transition-transform ${!isLiked ? 'active:scale-90' : 'cursor-default'}`}
          >
            <Heart
              className={`h-5 w-5 transition-colors ${
                isLiked
                  ? "fill-red-500 text-red-500"
                  : "text-muted-foreground"
              }`}
            />
            <span className="font-medium">{likes.length}</span>
          </button>
        </div>

        {polls.length > 0 && <PollSection poll={polls[0]} />}

        <CommentSection chapterId={id} />
      </div>

      {showShare && (
        <ShareModal chapter={chapter} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}