import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { StaffArea } from "@/components/staff/StaffArea";

export const metadata: Metadata = {
  title: "Staff",
  description: "World Bridge Meridian staff tools.",
  robots: { index: false, follow: false },
};

export default function StaffPage() {
  return (
    <section className="pb-24 pt-32 md:pt-40">
      <Container>
        <StaffArea />
      </Container>
    </section>
  );
}
