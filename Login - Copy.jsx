const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Edit3, Trash2, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import moment from "moment";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isAdmin = user?.role === "admin";

  const { data: chapters = [] } = useQuery({
    queryKey: ["admin-chapters"],
    queryFn: () => db.entities.Chapter.list("-created_date", 100),
  });

  const { data: characters = [] } = useQuery({
    queryKey: ["admin-characters"],
    queryFn: () => db.entities.Character.list(),
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["admin-comments"],
    queryFn: () => db.entities.Comment.list("-created_date", 100),
  });

  const { data: followers = [] } = useQuery({
    queryKey: ["admin-followers"],
    queryFn: () => db.entities.Follow.list(),
  });

  const { data: likes = [] } = useQuery({
    queryKey: ["admin-likes"],
    queryFn: () => db.entities.ChapterLike.list(),
  });

  const { data: polls = [] } = useQuery({
    queryKey: ["admin-polls"],
    queryFn: () => db.entities.Poll.list("-created_date", 50),
  });

  const deleteChapter = useMutation({
    mutationFn: (id) => db.entities.Chapter.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chapters"] });
      toast.success("Chapter deleted");
    },
  });

  const deleteCharacter = useMutation({
    mutationFn: (id) => db.entities.Character.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-characters"] });
      toast.success("Character deleted");
    },
  });

  const deleteComment = useMutation({
    mutationFn: (id) => db.entities.Comment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
      toast.success("Comment deleted");
    },
  });

  const deletePoll = useMutation({
    mutationFn: (id) => db.entities.Poll.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-polls"] });
      toast.success("Poll deleted");
    },
  });

  if (!isAdmin)
    return <div className="p-8 text-center text-muted-foreground">Access denied</div>;

  const statusColors = {
    draft: "bg-yellow-100 text-yellow-700",
    published: "bg-green-100 text-green-700",
    teaser: "bg-primary/10 text-primary",
  };

  return (
    <div>
      <div className="px-4 pt-3 pb-1">
        <h2 className="font-heading font-semibold">Admin Panel</h2>
      </div>

      <div className="px-4 pb-2 grid grid-cols-2 gap-2">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-primary">{followers.length}</p>
          <p className="text-xs text-muted-foreground">Followers</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-primary">{likes.length}</p>
          <p className="text-xs text-muted-foreground">Total Likes</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-primary">{comments.length}</p>
          <p className="text-xs text-muted-foreground">Comments</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-primary">{chapters.filter(c => c.status === 'published').length}</p>
          <p className="text-xs text-muted-foreground">Published</p>
        </div>
      </div>

      <div className="px-4 pb-8">
        <Tabs defaultValue="chapters">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="chapters" className="text-xs">Chapters</TabsTrigger>
            <TabsTrigger value="characters" className="text-xs">Characters</TabsTrigger>
            <TabsTrigger value="comments" className="text-xs">Comments</TabsTrigger>
            <TabsTrigger value="polls" className="text-xs">Polls</TabsTrigger>
          </TabsList>

          <TabsContent value="chapters" className="space-y-3 mt-4">
            <Link to="/admin/chapter">
              <Button className="w-full rounded-xl">
                <Plus className="h-4 w-4 mr-2" />New Chapter
              </Button>
            </Link>
            {chapters.map((ch) => (
              <div key={ch.id} className="bg-card border border-border rounded-xl p-3 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs text-muted-foreground">Ch. {ch.chapter_number}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusColors[ch.status] || ""}`}>
                      {ch.status}
                    </span>
                  </div>
                  <p className="font-medium text-sm truncate">{ch.title}</p>
                </div>
                <div className="flex gap-1 ml-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/chapter/${ch.id}`)}>
                    <Edit3 className="h-3.5 w-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete chapter?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteChapter.mutate(ch.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
            {chapters.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">No chapters yet</p>
            )}
          </TabsContent>

          <TabsContent value="characters" className="space-y-3 mt-4">
            <Link to="/admin/character">
              <Button className="w-full rounded-xl">
                <Plus className="h-4 w-4 mr-2" />New Character
              </Button>
            </Link>
            {characters.map((c) => (
              <div key={c.id} className="bg-card border border-border rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {c.image ? (
                    <img src={c.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.role_in_story}</p>
                  </div>
                </div>
                <div className="flex gap-1 ml-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/character/${c.id}`)}>
                    <Edit3 className="h-3.5 w-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete character?</AlertDialogTitle>
                        <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteCharacter.mutate(c.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="comments" className="space-y-3 mt-4">
            {comments.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">No comments yet</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="bg-card border border-border rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{c.user_name || c.created_by?.split("@")[0]}</span>
                      {c.is_writer && (
                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                          Writer
                        </span>
                      )}
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete comment?</AlertDialogTitle>
                          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteComment.mutate(c.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <p className="text-sm text-foreground/80">{c.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">{moment(c.created_date).fromNow()}</p>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="polls" className="space-y-3 mt-4">
            {polls.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                No polls yet. Create one when writing a chapter.
              </p>
            ) : (
              polls.map((p) => (
                <div key={p.id} className="bg-card border border-border rounded-xl p-3">
                  <p className="font-medium text-sm">{p.question}</p>
                  <p className="text-xs text-muted-foreground mt-1">{(p.options || []).join(" • ")}</p>
                  <div className="flex justify-end mt-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive text-xs">
                          <Trash2 className="h-3 w-3 mr-1" />Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete poll?</AlertDialogTitle>
                          <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deletePoll.mutate(p.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}