import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center bg-grid-texture">
      <Container className="py-24 text-center">
        <p className="eyebrow mb-4">404</p>
        <h1 className="font-display text-4xl md:text-5xl text-ivory">
          This page hasn&apos;t been mapped yet.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-stone">
          The page you&apos;re looking for doesn&apos;t exist, or may have moved. Let&apos;s get
          you back on course.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <Button href="/">Return Home</Button>
          <Button href="/explore" variant="outline">
            Explore Journeys
          </Button>
        </div>
      </Container>
    </section>
  );
}
