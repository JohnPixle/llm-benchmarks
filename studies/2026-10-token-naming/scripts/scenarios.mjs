export const blocks = [
  "primitives",
  "semantics",
  "typography",
  "foundations",
  "components",
];

export const scenarios = [
  {
    id: "S1",
    title: "SaaS analytics dashboard",
    brief:
      "A responsive analytics product with a navigation rail, KPI cards, charts, data tables, filters, and account controls.",
    concepts: {
      primitives: [
        ["S1-C01", "The central product-brand color"],
        ["S1-C02", "The lowest page background layer"],
        ["S1-C03", "A raised panel background layer"],
        ["S1-C04", "A subtle divider color"],
      ],
      semantics: [
        ["S1-C05", "Primary readable text"],
        ["S1-C06", "De-emphasized supporting text"],
        ["S1-C07", "The default primary action color"],
        ["S1-C08", "The hovered primary action color"],
      ],
      typography: [
        ["S1-C09", "The largest dashboard page heading"],
        ["S1-C10", "A heading for a dashboard section"],
        ["S1-C11", "Default interface body copy"],
        ["S1-C12", "Compact metadata and helper copy"],
      ],
      foundations: [
        ["S1-C13", "The smallest repeated interface gap"],
        ["S1-C14", "The standard content-group gap"],
        ["S1-C15", "The corner rounding used by controls"],
        ["S1-C16", "The elevation used by floating panels"],
      ],
      components: [
        ["S1-C17", "The primary button background"],
        ["S1-C18", "The primary button label color"],
        ["S1-C19", "The internal padding of a KPI card"],
        ["S1-C20", "The maximum width of the main content region"],
      ],
    },
  },
  {
    id: "S2",
    title: "Editorial publishing site",
    brief:
      "A digital magazine with a masthead, issue navigation, feature stories, article pages, author metadata, pull quotes, and newsletters.",
    concepts: {
      primitives: [
        ["S2-C01", "The publication's distinctive accent color"],
        ["S2-C02", "The base reading-page background"],
        ["S2-C03", "The strongest ink-like color"],
        ["S2-C04", "A quiet rule or separator color"],
      ],
      semantics: [
        ["S2-C05", "The default inline-link color"],
        ["S2-C06", "The hovered inline-link color"],
        ["S2-C07", "The background of selected text"],
        ["S2-C08", "The color used for urgent editorial notices"],
      ],
      typography: [
        ["S2-C09", "The publication masthead lettering"],
        ["S2-C10", "The main article headline"],
        ["S2-C11", "Long-form article copy"],
        ["S2-C12", "Bylines, dates, and reading-time copy"],
      ],
      foundations: [
        ["S2-C13", "A compact spacing step for metadata"],
        ["S2-C14", "A generous spacing step between article sections"],
        ["S2-C15", "The corner rounding used by article imagery"],
        ["S2-C16", "The elevation used by an overlaid story card"],
      ],
      components: [
        ["S2-C17", "The active issue-navigation item color"],
        ["S2-C18", "The border color of a story preview card"],
        ["S2-C19", "The readable maximum width of article prose"],
        ["S2-C20", "The viewport threshold for the wide article layout"],
      ],
    },
  },
  {
    id: "S3",
    title: "Ecommerce storefront",
    brief:
      "A modern storefront with category navigation, product grids, product detail pages, price and inventory states, a cart drawer, and checkout actions.",
    concepts: {
      primitives: [
        ["S3-C01", "The store's main brand color"],
        ["S3-C02", "The storefront page background"],
        ["S3-C03", "The product-card surface color"],
        ["S3-C04", "The strongest neutral color"],
      ],
      semantics: [
        ["S3-C05", "The color indicating an available product"],
        ["S3-C06", "The color indicating an unavailable product"],
        ["S3-C07", "The default purchase-action color"],
        ["S3-C08", "The disabled purchase-action color"],
      ],
      typography: [
        ["S3-C09", "A product-detail title"],
        ["S3-C10", "The current product price"],
        ["S3-C11", "Default product-description copy"],
        ["S3-C12", "Small inventory and shipping copy"],
      ],
      foundations: [
        ["S3-C13", "The gap between compact product attributes"],
        ["S3-C14", "The gap between major product-page regions"],
        ["S3-C15", "The corner rounding used by product cards"],
        ["S3-C16", "The elevation used by the cart drawer"],
      ],
      components: [
        ["S3-C17", "The add-to-cart button background"],
        ["S3-C18", "The sale-badge background"],
        ["S3-C19", "The gap between cards in a product grid"],
        ["S3-C20", "The viewport threshold where the product grid gains columns"],
      ],
    },
  },
  {
    id: "S4",
    title: "Professional-services marketing site",
    brief:
      "A consulting firm's marketing site with a confident hero, service summaries, case studies, testimonials, team profiles, and lead-generation forms.",
    concepts: {
      primitives: [
        ["S4-C01", "The firm's primary identity color"],
        ["S4-C02", "The base page background"],
        ["S4-C03", "A contrasting section background"],
        ["S4-C04", "A restrained decorative-line color"],
      ],
      semantics: [
        ["S4-C05", "The strongest heading and body text color"],
        ["S4-C06", "The supporting-copy color"],
        ["S4-C07", "The default call-to-action color"],
        ["S4-C08", "The keyboard-focus indicator color"],
      ],
      typography: [
        ["S4-C09", "The high-impact hero statement"],
        ["S4-C10", "A heading introducing a service group"],
        ["S4-C11", "Default marketing body copy"],
        ["S4-C12", "Testimonial attribution copy"],
      ],
      foundations: [
        ["S4-C13", "The compact gap used inside small content groups"],
        ["S4-C14", "The vertical separation between major page sections"],
        ["S4-C15", "The corner rounding used by form controls"],
        ["S4-C16", "The elevation used by a featured case-study card"],
      ],
      components: [
        ["S4-C17", "The consultation button background"],
        ["S4-C18", "The consultation button label color"],
        ["S4-C19", "The internal padding of a testimonial card"],
        ["S4-C20", "The maximum width of a standard marketing section"],
      ],
    },
  },
  {
    id: "S5",
    title: "General-purpose website system",
    brief:
      "A reusable website foundation intended to support content pages, marketing sections, forms, navigation, cards, dialogs, and responsive layouts.",
    concepts: {
      primitives: [
        ["S5-C01", "The foundational brand hue"],
        ["S5-C02", "The lightest neutral step"],
        ["S5-C03", "A middle neutral step"],
        ["S5-C04", "The darkest neutral step"],
      ],
      semantics: [
        ["S5-C05", "The default page surface"],
        ["S5-C06", "The default readable content color"],
        ["S5-C07", "The color communicating successful completion"],
        ["S5-C08", "The color communicating a destructive action"],
      ],
      typography: [
        ["S5-C09", "The largest display-text role"],
        ["S5-C10", "A middle-level content heading"],
        ["S5-C11", "The default paragraph role"],
        ["S5-C12", "The smallest supporting-text role"],
      ],
      foundations: [
        ["S5-C13", "The smallest nonzero spacing step"],
        ["S5-C14", "A middle spacing step"],
        ["S5-C15", "The standard control corner rounding"],
        ["S5-C16", "The standard floating-overlay elevation"],
      ],
      components: [
        ["S5-C17", "The default button background"],
        ["S5-C18", "The invalid form-field border"],
        ["S5-C19", "The internal padding of a generic card"],
        ["S5-C20", "The viewport threshold where compact navigation becomes expanded navigation"],
      ],
    },
  },
];
