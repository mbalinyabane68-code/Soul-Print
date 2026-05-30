const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/lib/AuthContext";
import { ArrowLeft, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function AdminCharacterForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [form, setForm] = useState({
    name: "",
    bio: "",
    image: "",
    role_in_story: "",
  });
  const [saving, setSaving] = useState(false);

  const { data: character } = useQuery({
    queryKey: ["character-edit", id],
    queryFn: () => db.entities.Character.get(id),
    enabled: isEdit,
  });

  useEffect(() => {
    if (character) {
      setForm({
        name: character.name || "",
        bio: character.bio || "",
        image: character.image || "",
        role_in_story: character.role_in_story || "",
      });
    }
  }, [character]);

  if (user?.role !== "admin")
    return <div className="p-8 text-center">Access denied</div>;

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setForm((f) => ({ ...f, image: file_url }));
    toast.success("Image uploaded!");
  };

  const handleSave = async () => {
    setSaving(true);
    if (isEdit) {
      await db.entities.Character.update(id, form);
    } else {
      await db.entities.Character.create(form);
    }
    queryClient.invalidateQueries({ queryKey: ["admin-characters"] });
    queryClient.invalidateQueries({ queryKey: ["characters"] });
    toast.success(isEdit ? "Character updated!" : "Character created!");
    setSaving(false);
    navigate("/admin");
  };

  return (
    <div>
      <div className="px-4 pt-3 pb-1">
        <h2 className="font-heading font-semibold">{isEdit ? "Edit Character" : "New Character"}</h2>
      </div>

      <div className="px-4 pb-8 space-y-5">
        {form.image && (
          <img
            src={form.image}
            alt=""
            className="w-full h-48 object-cover rounded-xl"
          />
        )}
        <label className="flex items-center gap-2 text-sm text-primary cursor-pointer">
          <Upload className="h-4 w-4" />
          <span>{form.image ? "Change image" : "Upload character image"}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>

        <Input
          placeholder="Character name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="rounded-xl"
        />

        <Input
          placeholder="Role in story (e.g. Protagonist, Antagonist)"
          value={form.role_in_story}
          onChange={(e) =>
            setForm((f) => ({ ...f, role_in_story: e.target.value }))
          }
          className="rounded-xl"
        />

        <Textarea
          placeholder="Character bio and backstory..."
          value={form.bio}
          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
          rows={6}
          className="rounded-xl"
        />

        <Button
          onClick={handleSave}
          disabled={!form.name || saving}
          className="w-full h-12 rounded-xl font-semibold"
        >
          {saving
            ? "Saving..."
            : isEdit
            ? "Update Character"
            : "Create Character"}
        </Button>
      </div>
    </div>
  );
}