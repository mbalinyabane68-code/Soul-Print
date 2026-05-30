import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import moment from "moment";

export default function ChapterCard({ chapter }) {
  return (
    <Link
      to={`/chapter/${chapter.id}`}
      className="block bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all active:scale-[0.98]"
    >
      {chapter.cover_image && (
        <img
          src={chapter.cover_image}
          alt={chapter.title}
          className="w-full h-36 object-cover"
        />
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs text-primary font-semibold">
            Chapter {chapter.chapter_number}
          </span>
          {chapter.published_date && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {moment(chapter.published_date).fromNow()}
            </span>
          )}
        </div>
        <h3 className="font-heading font-semibold text-foreground">
          {chapter.title}
        </h3>
        {chapter.preview_text && (
          <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
            {chapter.preview_text}
          </p>
        )}
      </div>
    </Link>
  );
}