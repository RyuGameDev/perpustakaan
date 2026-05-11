type BookCoverProps = {
  title: string;
  author?: string | null;
  url?: string | null;
  size?: "sm" | "md" | "lg";
};

export function BookCover({ title, author, url, size = "md" }: BookCoverProps) {
  return (
    <div className={`book-cover book-cover-${size}`}>
      {url ? (
        <img src={url} alt={`Cover ${title}`} />
      ) : (
        <div className="book-cover-fallback">
          <span>{title.slice(0, 2).toUpperCase()}</span>
          <small>{author || "Perpustakaan"}</small>
        </div>
      )}
    </div>
  );
}
