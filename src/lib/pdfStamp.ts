import type { jsPDF } from "jspdf";

type RGB = [number, number, number];

/** What the stamp needs from the PDF being built. */
export interface StampCtx {
  doc: jsPDF;
  setF: (font: "helvetica" | "times", style: "normal" | "bold" | "italic" | "bolditalic") => void;
  faint: (opacity: number, draw: () => void) => void;
  fill: (c: RGB) => void;
}

/** A round, rubber-stamp style "PAID" seal with the company name set around its edge. Tilted slightly, like a real stamp. */
export function drawPaidStamp({ doc, setF, faint, fill }: StampCtx, cx: number, cy: number, r: number, when: Date) {

  const INKC: RGB = [24, 112, 74];
  const tilt = 10; // degrees, counter-clockwise
  const rad = (d: number) => (d * Math.PI) / 180;
  const rot = (dx: number, dy: number): [number, number] => {
    const a = rad(tilt);
    return [cx + dx * Math.cos(a) + dy * Math.sin(a), cy - dx * Math.sin(a) + dy * Math.cos(a)];
  };
  // Text along an arc. Top text reads clockwise over the top; bottom text reads left to right along the bottom.
  const arc = (s: string, radius: number, top: boolean, size: number, track: number) => {
    setF("helvetica", "bold");
    doc.setFontSize(size);
    doc.setTextColor(...INKC);
    const ws = [...s].map((ch) => doc.getTextWidth(ch));
    const total = ws.reduce((a, w) => a + w + track, -track) / radius; // radians
    let t = top ? Math.PI / 2 + total / 2 : (3 * Math.PI) / 2 - total / 2;
    [...s].forEach((ch, i) => {
      const half = ws[i] / radius / 2;
      const th = top ? t - half : t + half;
      const thDeg = (th * 180) / Math.PI + tilt;
      const angle = top ? thDeg - 90 : thDeg - 270;
      const px = cx + radius * Math.cos(rad(thDeg));
      const py = cy - radius * Math.sin(rad(thDeg));
      const a = rad(angle);
      if (ch !== " ") doc.text(ch, px - (ws[i] / 2) * Math.cos(a), py + (ws[i] / 2) * Math.sin(a), { angle });
      const step = (ws[i] + track) / radius;
      t = top ? t - step : t + step;
    });
  };
  faint(0.88, () => {
    doc.setDrawColor(...INKC);
    doc.setLineWidth(1.1);
    doc.circle(cx, cy, r, "S");
    doc.setLineWidth(0.3);
    doc.circle(cx, cy, r - 1.7, "S");
    doc.circle(cx, cy, r - 9.2, "S");
    arc("WORLD BRIDGE MERIDIAN", r - 6.9, true, 6.1, 0.55);
    arc("BESPOKE TRAVEL GROUP", r - 4.5, false, 5.6, 0.5);
    // separator dots at 9 and 3 o'clock
    fill(INKC);
    for (const sign of [-1, 1]) {
      const [dx, dy] = rot(sign * (r - 5.6), 0);
      doc.circle(dx, dy, 0.55, "F");
    }
    const inner = (s: string, dx: number, dy: number, size: number, spacing: number) => {
      const [px, py] = rot(dx, dy);
      setF("helvetica", "bold");
      doc.setFontSize(size);
      doc.setTextColor(...INKC);
      doc.text(s, px, py, { align: "center", angle: tilt, charSpace: spacing });
    };
    inner(when.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase(), 0, -6.4, 4.8, 0.4);
    inner("PAID", 0, 3.6, 17, 1);
    inner("PAYMENT RECEIVED", 0, 8.1, 3.4, 0.2);
    doc.setLineWidth(0.3);
    const [ax, ay] = rot(-7, -4.3);
    const [bx, by] = rot(7, -4.3);
    doc.line(ax, ay, bx, by);
  });
}
