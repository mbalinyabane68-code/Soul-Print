const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/lib/AuthContext";
import { ArrowLeft, Upload, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import MobileSelect from "../components/MobileSelect";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function AdminChapterForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [form, setForm] = useState({
    title: "",
    chapter_number: 1,
    status: "draft",
    teaser: "",
    preview_text: "",
    content: "",
    cover_image: "",
  });
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [saving, setSaving] = useState(false);

  const { data: chapter } = useQuery({
    queryKey: ["chapter-edit", id],
    queryFn: () => db.entities.Chapter.get(id),
    enabled: isEdit,
  });

  const { data: existingPolls = [] } = useQuery({
    queryKey: ["poll-edit", id],
    queryFn: () => db.entities.Poll.filter({ chapter_id: id }),
    enabled: isEdit,
  });

  useEffect(() => {
    if (chapter) {
      setForm({
        title: chapter.title || "",
        chapter_number: chapter.chapter_number || 1,
        status: chapter.status || "draft",
        teaser: chapter.teaser || "",
        preview_text: chapter.preview_text || "",
        content: chapter.content || "",
        cover_image: chapter.cover_image || "",
      });
    }
  }, [chapter]);

  useEffect(() => {
    if (existingPolls.length > 0) {
      const p = existingPolls[0];
      setPollQuestion(p.question || "");
      setPollOptions(p.options || ["", ""]);
    }
  }, [existingPolls]);

  if (user?.role !== "admin") return <div className="p-8 text-center">Access denied</div>;

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await db.integrations.Core.UploadFile({ file });
    setForm((f) => ({ ...f, cover_image: file_url }));
    toast.success("Image uploaded!");
  };

  const handleSave = async () => {
    setSaving(true);
    const data = {
      ...form,
      published_date: form.status === "published" ? new Date().toISOString() : undefined,
    };

    let chapterId = id;
    if (isEdit) {
      await db.entities.Chapter.update(id, data);
    } else {
      const created = await db.entities.Chapter.create(data);
      chapterId = created.id;
    }

    // Handle poll
    if (pollQuestion.trim() && pollOptions.filter((o) => o.trim()).length >= 2) {
      const pollData = {
        chapter_id: chapterId,
        question: pollQuestion,
        options: pollOptions.filter((o) => o.trim()),
      };
      if (existingPolls.length > 0) {
        await db.entities.Poll.update(existingPolls[0].id, pollData);
      } else {
        await db.entities.Poll.create(pollData);
      }
    }

    // Create notification for published chapters
    if (form.status === "published" && (!isEdit || chapter?.status !== "published")) {
      await db.entities.Notification.create({
        title: `New Chapter: ${form.title}`,
        message: `Chapter ${form.chapter_number} is now live! Tap to read.`,
        chapter_id: chapterId,
        notification_type: "new_chapter",
      });
    }

    queryClient.invalidateQueries({ queryKey: ["admin-chapters"] });
    toast.success(isEdit ? "Chapter updated!" : "Chapter created!");
    setSaving(false);
    navigate("/admin");
  };

  const updateField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <div>
      <div className="px-4 pt-3 pb-1">
        <h2 className="font-heading font-semibold">{isEdit ? "Edit Chapter" : "New Chapter"}</h2>
      </div>

      <div className="px-4 pb-8 space-y-5">
        <div className="space-y-3">
          <Input
            placeholder="Chapter title"
            value={form.title}
            onChange={(e) => updateField("title", e.target.value)}
            className="rounded-xl"
          />
          <div className="flex gap-3">
            <Input
              type="number"
              placeholder="Ch. #"
              value={form.chapter_number}
              onChange={(e) => updateField("chapter_number", parseInt(e.target.value) || 1)}
              className="w-24 rounded-xl"
            />
            <MobileSelect
              value={form.status}
              onValueChange={(v) => updateField("status", v)}
              placeholder="Status"
              className="rounded-xl"
              options={[
                { value: "draft", label: "Draft" },
                { value: "teaser", label: "Teaser / Coming Soon" },
                { value: "published", label: "Published" },
              ]}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Cover Image</label>
          {form.cover_image && (
            <img src={form.cover_image} alt="" className="w-full h-32 object-cover rounded-xl mb-2" />
          )}
          <label className="flex items-center gap-2 text-sm text-primary cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>Upload cover image</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>

        <Tabs defaultValue="teaser">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="teaser" className="text-xs">Teaser</TabsTrigger>
            <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
            <TabsTrigger value="full" className="text-xs">Full Chapter</TabsTrigger>
          </TabsList>
          <TabsContent value="teaser" className="mt-3">
            <Textarea
              placeholder="Write a short teaser to hook your readers..."
              value={form.teaser}
              onChange={(e) => updateField("teaser", e.target.value)}
              rows={4}
              className="rounded-xl"
            />
          </TabsContent>
          <TabsContent value="preview" className="mt-3">
            <Textarea
              placeholder="Write a preview snippet..."
              value={form.preview_text}
              onChange={(e) => updateField("preview_text", e.target.value)}
              rows={6}
              className="rounded-xl"
            />
          </TabsContent>
          <TabsContent value="full" className="mt-3">
            <Textarea
              placeholder="Write your full chapter here..."
              value={form.content}
              onChange={(e) => updateField("content", e.target.value)}
              rows={12}
              className="rounded-xl"
            />
          </TabsContent>
        </Tabs>

        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-sm">Reader Poll (optional)</h3>
          <Input
            placeholder="Ask your readers a question..."
            value={pollQuestion}
            onChange={(e) => setPollQuestion(e.target.value)}
            className="rounded-xl"
          />
          {pollOptions.map((opt, idx) => (
            <div key={idx} className="flex gap-2">
              <Input
                placeholder={`Option ${idx + 1}`}
                value={opt}
                onChange={(e) => {
                  const updated = [...pollOptions];
                  updated[idx] = e.target.value;
                  setPollOptions(updated);
                }}
                className="rounded-xl"
              />
              {pollOptions.length > 2 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {pollOptions.length < 5 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPollOptions([...pollOptions, ""])}
              className="rounded-xl"
            >
              <Plus className="h-3 w-3 mr-1" /> Add Option
            </Button>
          )}
        </div>

        <Button
          onClick={handleSave}
          disabled={!form.title || saving}
          className="w-full h-12 rounded-xl font-semibold"
        >
          {saving ? "Saving..." : isEdit ? "Update Chapter" : "Create Chapter"}
        </Button>
      </div>
    </div>
  );
}