export interface NavLink {
  label: string;
  href: string;
}

export interface NavGroup {
  heading: string;
  links: NavLink[];
}

export const primaryNav: NavLink[] = [
  { label: "Explore", href: "/explore" },
  { label: "Journey Stories", href: "/journey-stories" },
  { label: "Journal", href: "/journal" },
  { label: "About Us", href: "/about" },
  { label: "My World Bridge", href: "/my-world-bridge" },
];

export const menuGroups: NavGroup[] = [
  {
    heading: "Journeys",
    links: [
      { label: "Destinations", href: "/destinations" },
      { label: "Travel Packages", href: "/travel-packages" },
      { label: "Journey Stories", href: "/journey-stories" },
      { label: "Current Journeys", href: "/current-journeys" },
      { label: "Holiday Collection", href: "/holiday-collection" },
      { label: "Journeys for Life's Moments", href: "/occasions" },
      { label: "Cruises", href: "/cruises" },
      { label: "Experiences", href: "/experiences" },
      { label: "Stays", href: "/stays" },
    ],
  },
  {
    heading: "Our Expertise",
    links: [
      { label: "Bespoke Journeys", href: "/bespoke" },
      { label: "Private Journeys", href: "/private-journeys" },
      { label: "Luxury Travel", href: "/luxury-travel" },
      { label: "Arts & Culture", href: "/arts-culture" },
      { label: "Family Travel", href: "/family-travel" },
      { label: "Couples Travel", href: "/couples-travel" },
      { label: "Group Travel", href: "/group-travel" },
      { label: "Institutional Travel", href: "/institutional" },
      { label: "Corporate Travel", href: "/corporate-travel" },
    ],
  },
  {
    heading: "Arts & Culture",
    links: [
      { label: "Gallery Exhibitions", href: "/exhibitions" },
      { label: "Museum Exhibitions", href: "/museums" },
      { label: "Art Fairs", href: "/art-fairs" },
      { label: "Travel Calendar", href: "/calendar" },
    ],
  },
  {
    heading: "About",
    links: [
      { label: "About World Bridge Meridian", href: "/about" },
      { label: "How We Work", href: "/how-we-work" },
      { label: "Leadership", href: "/leadership" },
      { label: "Careers", href: "/careers" },
      { label: "Partners", href: "/partners" },
      { label: "Reviews", href: "/reviews" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Travel Journal", href: "/journal" },
      { label: "FAQs", href: "/faq" },
    ],
  },
  {
    heading: "Contact",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "Plan Your Journey", href: "/plan-your-journey" },
      { label: "Payment Options", href: "/payments" },
    ],
  },
  {
    heading: "My World Bridge",
    links: [
      { label: "My Account", href: "/my-world-bridge" },
      { label: "Compare Journeys", href: "/compare" },
    ],
  },
];

export const legalLinks: NavLink[] = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
];

export const footerColumns: NavGroup[] = [
  {
    heading: "Explore",
    links: [
      { label: "Destinations", href: "/destinations" },
      { label: "Travel Packages", href: "/travel-packages" },
      { label: "Journey Stories", href: "/journey-stories" },
      { label: "Holiday Collection", href: "/holiday-collection" },
      { label: "Cruises", href: "/cruises" },
      { label: "Current Journeys", href: "/current-journeys" },
      { label: "Travel Calendar", href: "/calendar" },
      { label: "Journal", href: "/journal" },
    ],
  },
  {
    heading: "Journey Services",
    links: [
      { label: "Bespoke Journeys", href: "/bespoke" },
      { label: "Private Journeys", href: "/private-journeys" },
      { label: "Arts & Culture", href: "/arts-culture" },
      { label: "Family Travel", href: "/family-travel" },
      { label: "Couples Travel", href: "/couples-travel" },
      { label: "Group Travel", href: "/group-travel" },
      { label: "Institutional Travel", href: "/institutional" },
      { label: "Corporate Travel", href: "/corporate-travel" },
    ],
  },
  {
    heading: "About",
    links: [
      { label: "About Us", href: "/about" },
      { label: "How We Work", href: "/how-we-work" },
      { label: "Leadership", href: "/leadership" },
      { label: "Our Network", href: "/partners" },
      { label: "Careers", href: "/careers" },
      { label: "Reviews", href: "/reviews" },
      { label: "FAQs", href: "/faq" },
      { label: "My World Bridge", href: "/my-world-bridge" },
    ],
  },
];
