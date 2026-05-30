const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/lib/AuthContext";
import { Trash2, Send, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import moment from "moment";

export default function CommentSection({ chapterId }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  const EMOJIS = ['😊','😂','❤️','🔥','👏','😭','💕','✨','🥰','😍','💯','🙏','😎','🤔','💙','🌸','😢','🎉','💪','👀'];
  const isAdmin = user?.role === "admin";

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", chapterId],
    queryFn: () =>
      db.entities.Comment.filter(
        { chapter_id: chapterId },
        "-created_date",
        100
      ),
  });

  const addComment = useMutation({
    mutationFn: (content) =>
      db.entities.Comment.create({
        chapter_id: chapterId,
        content,
        user_name: user?.full_name || user?.email?.split("@")[0],
        user_email: user?.email,
        is_writer: isAdmin,
      }),
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: ["comments", chapterId] });
      const prev = queryClient.getQueryData(["comments", chapterId]);
      const optimistic = {
        id: "optimistic-" + Date.now(),
        chapter_id: chapterId,
        content,
        user_name: user?.full_name || user?.email?.split("@")[0],
        user_email: user?.email,
        is_writer: isAdmin,
        created_date: new Date().toISOString(),
      };
      queryClient.setQueryData(["comments", chapterId], (old = []) => [optimistic, ...old]);
      setText("");
      return { prev };
    },
    onError: (_err, _v, ctx) =>
      queryClient.setQueryData(["comments", chapterId], ctx?.prev),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["comments", chapterId] }),
  });

  const deleteComment = useMutation({
    mutationFn: (id) => db.entities.Comment.delete(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["comments", chapterId] }),
  });

  const handleSubmit = () => {
    if (text.trim()) addComment.mutate(text.trim());
  };

  return (
    <div className="space-y-4">
      <h3 className="font-heading font-semibold text-lg">
        Comments ({comments.length})
      </h3>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts..."
            className="pr-10 rounded-xl"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <button
            type="button"
            onClick={() => setShowEmoji((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
          >
            <Smile className="h-4 w-4 text-primary/60 hover:text-primary transition-colors" />
          </button>
          {showEmoji && (
            <div className="absolute bottom-full left-0 right-0 bg-card border border-border rounded-xl p-2 mb-1 z-20 shadow-lg">
              <div className="grid grid-cols-10 gap-0.5">
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => { setText((t) => t + e); setShowEmoji(false); }}
                    className="text-xl p-1.5 hover:bg-muted rounded-lg transition-colors"
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="rounded-xl"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="bg-muted/50 rounded-xl p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {c.user_name || c.created_by?.split("@")[0]}
                </span>
                {c.is_writer && (
                  <Badge className="text-[10px] bg-primary/10 text-primary border-0 px-1.5 py-0">
                    Writer
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground">
                  {moment(c.created_date).fromNow()}
                </span>
              </div>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => deleteComment.mutate(c.id)}
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              )}
            </div>
            <p className="text-sm leading-relaxed">{c.content}</p>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-6">
            Be the first to share your thoughts!
          </p>
        )}
      </div>
    </div>
  );
}