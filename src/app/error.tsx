"use client";

import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { company } from "@/data/company";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="flex min-h-[70vh] items-center bg-grid-texture">
      <Container className="py-24 text-center">
        <p className="eyebrow mb-4">Something went wrong</p>
        <h1 className="font-display text-4xl md:text-5xl text-ivory">
          This page didn&apos;t load as it should.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-stone">
          Nothing you were doing has been lost. Try again, or write to us at{" "}
          <a href={`mailto:${company.email}`} className="text-ivory underline">
            {company.email}
          </a>{" "}
          and we&apos;ll help directly.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <Button onClick={reset}>Try Again</Button>
          <Button href="/" variant="outline">
            Return Home
          </Button>
        </div>
      </Container>
    </section>
  );
}
