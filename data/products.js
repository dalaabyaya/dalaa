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
     colors          each colour has a name, a hex swatch, photos, and stock per size
     featured        true to show on the home page
   Photos: put files in /assets/products/ and list them, first one is the main photo.
   ========================================================== */
(function () {
  var SIZES = ["XS", "S", "M", "L", "XL"];
  function p(o) { o.placeholder = true; o.sizes = SIZES; return o; }

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
    p({
      id: "ph-02", slug: "placeholder-top-02",
      name: "Placeholder Full-length Top 02", type: "Full-length top", price: null, badge: "Bestseller", featured: true,
      description: "Placeholder product. Replace this with your real description.",
      colors: [
        { name: "Cherry (placeholder)", hex: "#B3122E", images: [], stock: { XS: 0, S: 4, M: 6, L: 3, XL: 1 } },
        { name: "Chocolate (placeholder)", hex: "#3B2018", images: [], stock: { XS: 2, S: 2, M: 2, L: 2, XL: 2 } },
        { name: "Ivory (placeholder)", hex: "#FFF1E4", images: [], stock: { XS: 1, S: 1, M: 0, L: 1, XL: 0 } }
      ]
    }),
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
