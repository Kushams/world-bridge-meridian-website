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
  { label: "Journal", href: "/journal" },
  { label: "About Us", href: "/about" },
  { label: "My World Bridge", href: "/my-world-bridge" },
];

export const menuGroups: NavGroup[] = [
  {
    heading: "Explore",
    links: [
      { label: "Destinations", href: "/destinations" },
      { label: "Travel Packages", href: "/travel-packages" },
      { label: "Cruises", href: "/cruises" },
      { label: "Experiences", href: "/experiences" },
      { label: "Current Journeys", href: "/current-journeys" },
      { label: "Stays", href: "/stays" },
    ],
  },
  {
    heading: "Our Expertise",
    links: [
      { label: "Bespoke Journeys", href: "/bespoke" },
      { label: "Luxury Travel", href: "/luxury-travel" },
      { label: "Arts & Culture", href: "/arts-culture" },
      { label: "Family Travel", href: "/family-travel" },
      { label: "Couples Travel", href: "/couples-travel" },
      { label: "Group Travel", href: "/group-travel" },
      { label: "Corporate Travel", href: "/corporate-travel" },
    ],
  },
  {
    heading: "Arts & Culture",
    links: [
      { label: "Gallery Exhibitions", href: "/exhibitions" },
      { label: "Museum Exhibitions", href: "/museums" },
      { label: "Art Fairs", href: "/art-fairs" },
    ],
  },
  {
    heading: "About",
    links: [
      { label: "About World Bridge Meridian", href: "/about" },
      { label: "Leadership", href: "/leadership" },
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
    links: [{ label: "My Account", href: "/my-world-bridge" }],
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
      { label: "Cruises", href: "/cruises" },
      { label: "Experiences", href: "/experiences" },
      { label: "Current Journeys", href: "/current-journeys" },
      { label: "Journal", href: "/journal" },
    ],
  },
  {
    heading: "Our Expertise",
    links: [
      { label: "Bespoke Journeys", href: "/bespoke" },
      { label: "Luxury Travel", href: "/luxury-travel" },
      { label: "Family Travel", href: "/family-travel" },
      { label: "Couples Travel", href: "/couples-travel" },
      { label: "Group Travel", href: "/group-travel" },
      { label: "Arts & Culture", href: "/arts-culture" },
      { label: "Gallery Exhibitions", href: "/exhibitions" },
      { label: "Museum Exhibitions", href: "/museums" },
      { label: "Art Fairs", href: "/art-fairs" },
      { label: "Corporate Travel", href: "/corporate-travel" },
    ],
  },
  {
    heading: "About",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Leadership", href: "/leadership" },
      { label: "Partners", href: "/partners" },
      { label: "Reviews", href: "/reviews" },
      { label: "FAQs", href: "/faq" },
    ],
  },
];
