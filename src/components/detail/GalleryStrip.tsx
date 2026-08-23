import Image from "next/image";

export function GalleryStrip({ images, alt }: { images: string[]; alt: string }) {
  if (!images.length) return null;
  return (
    <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scroll-px-6">
      {images.map((src, i) => (
        <div
          key={i}
          className="relative h-56 w-80 shrink-0 snap-center overflow-hidden rounded-card md:h-72 md:w-[26rem]"
        >
          <Image
            src={src}
            alt={`${alt} — photo ${i + 1}`}
            fill
            sizes="420px"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
