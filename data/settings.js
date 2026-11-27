/* ==========================================================
   DALAA BY AYA — STORE SETTINGS
   Edit the text in quotes. Nothing else needs to change.
   ========================================================== */
window.DALAA_SETTINGS = {

  /* Slim banner at the very top of every page.
     Set enabled to false to hide it. Add more lines to rotate them. */
  announcement: {
    enabled: true,
    messages: [
      "دلعي نفسك"
      // "New drop landing Friday ♡",
      // "Free shipping on orders over $XX ♡",
    ],
    link: "" // optional, e.g. "shop.html"
  },

  /* Photography slots. Drop your photo into /assets/img/ and put the
     file name here (e.g. "assets/img/hero.jpg"). Empty = tasteful placeholder. */
  images: {
    hero: "assets/img/fabric-rolls.jpg", // swap for your campaign photo when you have one
    energyA: "assets/img/lake-dusk.jpg",
    energyB: "",
    storyPreview: "assets/img/story-sisters.jpg",
    storyOpening: "",
    storyStruggle: "assets/img/story-sisters.jpg",
    storyFrustration: "assets/img/story-golden-hour.jpg",
    storyHands: "",
    storyPhilosophy: ""
  },

  /* Links and contact details. Fill these in with your real ones. */
  contact: {
    email: "",                                   // e.g. "hello@yourdomain.com.au"
    instagram: "https://www.instagram.com/dalaabyaya/",
    location: "Melbourne, Victoria, Australia"
  },

  /* Newsletter + contact form delivery.
     Paste a form endpoint from Mailchimp, Klaviyo, Formspree etc.
     While empty, the site is honest that signups are not saved yet. */
  newsletterEndpoint: "",
  contactEndpoint: "",

  /* Checkout.
     "off"     = checkout is not connected yet (the site says so honestly).
     "shopify" = once Shopify is connected, the bag hands over to it. */
  checkout: {
    mode: "off",
    offMessage: "Checkout isn't switched on yet. Real orders can't be placed until a payment platform is connected.",
    shopifyCheckoutUrl: ""
  },

  /* Shipping + policy copy. Anything left as "TBC" shows as a gentle
     'to be confirmed' tag so nothing is promised by accident. */
  shipping: {
    cartNote: "Shipping calculated at checkout.",
    domesticTime: "TBC",
    domesticCost: "TBC",
    freeShippingOver: "",       // e.g. 150 (leave empty for none)
    internationalNote: "TBC",
    madeToOrderNote: "TBC",
    returnsWindow: "TBC",
    returnsConditions: "TBC"
  },

  /* Size guide: edit measurements in cm. "—" shows until you fill them in. */
  sizeGuide: {
    note: "Measurements to be added. Every Dalaa piece is handmade, so please allow a little wiggle room.",
    columns: ["Size", "Bust", "Waist", "Hip", "Length"],
    rows: [
      ["XS", "—", "—", "—", "—"],
      ["S",  "—", "—", "—", "—"],
      ["M",  "—", "—", "—", "—"],
      ["L",  "—", "—", "—", "—"],
      ["XL", "—", "—", "—", "—"]
    ]
  },

  /* Fabric & care shown on every product unless a product has its own. */
  defaultFabricCare: "Fabric and care details to be added for this piece."
};
