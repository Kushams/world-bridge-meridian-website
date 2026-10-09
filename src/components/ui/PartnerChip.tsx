import { localImage } from "@/data/images";
import type { CryptoPartner } from "@/data/cryptoPartners";

/** A partner's logo with its name. Wide light wordmarks sit on a dark tile so they stay readable. */
export function PartnerChip({ partner }: { partner: CryptoPartner }) {
  if (partner.wordmark) {
    return (
      <span className={`partner-chip ${partner.wordmark === "onLight" ? "partner-chip-light" : "partner-chip-dark"}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={localImage(partner.logo)} alt={partner.name} className="partner-wordmark" height={20} loading="lazy" />
      </span>
    );
  }
  return (
    <span className="partner-chip">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={localImage(partner.logo)} alt="" width={24} height={24} className="partner-icon" loading="lazy" />
      <span>{partner.name}</span>
    </span>
  );
}
