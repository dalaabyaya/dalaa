/* ==========================================================
   DALAA BY AYA — PRODUCTS
   Everything below is a PLACEHOLDER so you can see how the store works.
   Replace these with your real pieces (or connect Shopify, which will
   manage products, stock and photos for you — see README.md).

   For each product:
     id, slug        unique, lowercase, no spaces (slug is used in the link)
     name            product name
     type            e.g. "Dress", "Full-length top", "Skirt"
     price           number in AUD, e.g. 129. Leave null while unknown.
     badge           "New", "Bestseller" or ""
     description     a few sentences
     fabricCare      optional, overrides the default
     sizes           list of sizes
     specs           optional list of [label, value] rows for the Specifications dropdown.
                     Use "TBC" as a value to show "to be confirmed".
     colors          each colour has a name, a hex swatch, photos, and stock per size.
                     Optional per colour: swatch (any CSS background, e.g. a gradient, for the dot)
                     and note (a line shown under the colour picker when it is selected)
     featured        true to show on the home page
   Photos: put files in /assets/products/ and list them, first one is the main photo.
   ========================================================== */
(function () {
  var SIZES = ["XS", "S", "M", "L", "XL"];
  function p(o) { o.placeholder = true; o.sizes = SIZES; return o; }
  var SPARKLE_PHOTOS = ["assets/products/obsidian-sparkle.jpg", "assets/products/obsidian-sparkle-2.jpg"];

  window.DALAA_PRODUCTS = [
    p({
      id: "ph-01", slug: "placeholder-dress-01",
      name: "Placeholder Dress 01", type: "Dress", price: null, badge: "New", featured: true,
      description: "Placeholder product. Replace this with your real description: the silhouette, the details, how it moves.",
      colors: [
        { name: "Fuchsia (placeholder)", hex: "#D6246E", images: [], stock: { XS: 3, S: 5, M: 5, L: 2, XL: 0 } },
        { name: "Baby pink (placeholder)", hex: "#F7C6DA", images: [], stock: { XS: 1, S: 2, M: 4, L: 4, XL: 2 } }
      ]
    }),
    /* A real piece: Obsidian Sparkle. (Not wrapped in p(), so it is not marked as a placeholder.) */
    {
      id: "obsidian-sparkle", slug: "obsidian-sparkle",
      name: "Obsidian Sparkle", type: "Full-length top", price: 79, badge: "New", featured: true,
      sizes: SIZES,
      description: "A full-length top in deep obsidian black, with a high neckline and wide bell sleeves finished in sequin lace. Full coverage that still catches the light when you move. Handmade in Melbourne.",
      specs: [
        ["Style", "Full-length top"],
        ["Neckline", "High neck"],
        ["Sleeves", "Wide bell sleeves with sequin lace panels"],
        ["Colours", "Black, or your choice of fabric"],
        ["Sizes", "XS, S, M, L, XL"],
        ["Fabric", "TBC"],
        ["Fit", "TBC"],
        ["Length", "TBC"],
        ["Made", "Handmade in Melbourne"]
      ],
      colors: [
        { name: "Black", hex: "#0E0B0C", images: SPARKLE_PHOTOS,
          stock: { XS: 5, S: 5, M: 5, L: 5, XL: 5 } },
        { name: "Your choice of fabric", hex: "#C8A98F",
          swatch: "conic-gradient(from 30deg,#F7C6DA,#D6246E,#7B4B94,#2F6F8F,#E8B04B,#F7C6DA)",
          note: "Have a specific fabric in mind? Drop off your own fabric for 10% off",
          images: SPARKLE_PHOTOS, stock: { XS: 10, S: 10, M: 10, L: 10, XL: 10 } }
      ]
    },
    p({
      id: "ph-03", slug: "placeholder-skirt-03",
      name: "Placeholder Skirt 03", type: "Skirt", price: null, badge: "", featured: true,
      description: "Placeholder product. Replace this with your real description.",
      colors: [
        { name: "Hot pink (placeholder)", hex: "#E6338F", images: [], stock: { XS: 4, S: 4, M: 4, L: 4, XL: 4 } }
      ]
    }),
    p({
      id: "ph-04", slug: "placeholder-dress-04",
      name: "Placeholder Dress 04", type: "Dress", price: null, badge: "New", featured: true,
      description: "Placeholder product. Replace this with your real description.",
      colors: [
        { name: "Cherry (placeholder)", hex: "#B3122E", images: [], stock: { XS: 2, S: 3, M: 3, L: 3, XL: 1 } },
        { name: "Fuchsia (placeholder)", hex: "#D6246E", images: [], stock: { XS: 2, S: 3, M: 0, L: 3, XL: 1 } }
      ]
    }),
    p({
      id: "ph-05", slug: "placeholder-top-05",
      name: "Placeholder Full-length Top 05", type: "Full-length top", price: null, badge: "", featured: false,
      description: "Placeholder product. Replace this with your real description.",
      colors: [
        { name: "Baby pink (placeholder)", hex: "#F7C6DA", images: [], stock: { XS: 3, S: 3, M: 3, L: 3, XL: 3 } },
        { name: "Chocolate (placeholder)", hex: "#3B2018", images: [], stock: { XS: 1, S: 0, M: 2, L: 2, XL: 1 } }
      ]
    }),
    p({
      id: "ph-06", slug: "placeholder-set-06",
      name: "Placeholder Set 06", type: "Set", price: null, badge: "", featured: false,
      description: "Placeholder product. Replace this with your real description.",
      colors: [
        { name: "Hot pink (placeholder)", hex: "#E6338F", images: [], stock: { XS: 0, S: 0, M: 0, L: 0, XL: 0 } }
      ]
    })
  ];
})();
