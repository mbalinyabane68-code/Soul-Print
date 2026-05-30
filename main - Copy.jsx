const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";

import { useState } from "react";
import { Link } from "react-router-dom";
import { Camera, LogOut, Settings, Users, Edit3, Trash2, Sun, Moon } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function Profile() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(user?.bio || "");
  const isAdmin = user?.role === "admin";
  const { theme, toggle: toggleTheme } = useTheme();

  const { data: followers = [] } = useQuery({
    queryKey: ["followers-count"],
    queryFn: () => db.entities.Follow.list(),
    enabled: isAdmin,
  });

  const updateProfile = useMutation({
    mutationFn: (data) => db.auth.updateMe(data),
    onSuccess: () => {
      setEditing(false);
      toast.success("Profile updated!");
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    await db.auth.updateMe({ profile_picture: file_url });
    toast.success("Photo updated!");
    window.location.reload();
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col items-center text-center pt-4">
        <div className="relative mb-3">
          <div className="w-24 h-24 rounded-full bg-muted overflow-hidden border-2 border-primary/20">
            {user?.profile_picture ? (
              <img src={user.profile_picture} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-primary">
                {user?.full_name?.[0] || user?.email?.[0] || "?"}
              </div>
            )}
          </div>
          <label className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-2 cursor-pointer shadow-md">
            <Camera className="h-3.5 w-3.5" />
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>
        <h2 className="font-heading font-bold text-xl">{user?.full_name || "Reader"}</h2>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
        {isAdmin && (
          <span className="text-xs bg-primary/10 text-primary font-semibold px-3 py-1 rounded-full mt-2">
            Writer
          </span>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself..."
            rows={3}
            className="rounded-xl"
          />
          <div className="flex gap-2">
            <Button onClick={() => updateProfile.mutate({ bio })} className="flex-1 rounded-xl">
              Save
            </Button>
            <Button variant="outline" onClick={() => setEditing(false)} className="rounded-xl">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Bio</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setBio(user?.bio || "");
                setEditing(true);
              }}
            >
              <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
            </Button>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {user?.bio || "No bio yet. Tap edit to add one!"}
          </p>
        </div>
      )}

      {isAdmin && (
        <div className="space-y-2">
          <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">
            Admin
          </h3>
          <Link
            to="/admin"
            className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 hover:bg-muted/50 transition-colors active:scale-[0.98]"
          >
            <Settings className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-sm">Admin Panel</p>
              <p className="text-xs text-muted-foreground">
                {"Manage chapters, characters & polls"}
              </p>
            </div>
          </Link>
          <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-sm">Followers</p>
              <p className="text-xs text-muted-foreground">
                {followers.length} reader{followers.length !== 1 ? "s" : ""} following you
              </p>
            </div>
          </div>
        </div>
      )}

      {!isAdmin && (
        <Link
          to="/writer"
          className="block bg-gradient-to-r from-primary to-primary/80 rounded-xl p-4 text-white active:scale-[0.98] transition-transform"
        >
          <p className="text-xs text-white/60 mb-0.5">Meet the Writer</p>
          <p className="font-semibold text-sm">{"Discover the soul behind the words \u2192"}</p>
        </Link>
      )}

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1 rounded-xl"
          onClick={() => db.auth.logout()}
        >
          <LogOut className="h-4 w-4 mr-2" /> Sign Out
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="rounded-xl"
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      <div className="pt-2 border-t border-border">
        <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-2">Danger Zone</h3>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full rounded-xl">
              <Trash2 className="h-4 w-4 mr-2" /> Delete Account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your account?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove all your data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={async () => {
                  try {
                    await db.auth.logout();
                  } catch {}
                  window.location.href = "/welcome";
                }}
              >
                Delete Account
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}