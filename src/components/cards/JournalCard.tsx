import Image from "next/image";
import Link from "next/link";
import { JournalArticle } from "@/data/types";
import { formatDate } from "@/lib/format";

export function JournalCard({ article }: { article: JournalArticle }) {
  return (
    <Link href={`/journal/${article.slug}`} className="group block tap-shrink">
      <div className="relative aspect-[16/10] overflow-hidden rounded-card bg-charcoal">
        <Image
          src={article.heroImage}
          alt={article.title}
          fill
          sizes="(min-width: 1024px) 400px, (min-width: 640px) 45vw, 90vw"
          className="img-zoom object-cover"
        />
      </div>
      <div className="mt-4">
        <p className="eyebrow !text-[0.65rem] mb-1">
          {article.category} · {article.readingTime}
        </p>
        <h3 className="font-display text-lg text-ivory group-hover:text-gold transition-colors leading-snug">
          {article.title}
        </h3>
        <p className="mt-2 text-xs text-stone-dim">{formatDate(article.date)}</p>
      </div>
    </Link>
  );
}
