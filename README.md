# Dalaa by Aya: storefront

A fast, static, fully responsive store front-end built around your two logos.
Pages: `index.html` (Home), `shop.html` (Shop), `product.html` (product detail), `story.html` (Our Story), `info.html` (Contact, Shipping & Returns, FAQs).

Open `index.html` in a browser to preview. To publish, upload the whole folder to any static host (Netlify, Cloudflare Pages, Vercel, etc.).

## Where things live

| You want to change | Edit |
|---|---|
| Announcement bar text (or turn it off) | `data/settings.js` → `announcement` |
| Hero / story / campaign photos | drop files in `assets/img/`, then name them in `data/settings.js` → `images` |
| Products, prices, sizes, colours, stock, product photos | `data/products.js` |
| Social links, email, location | `data/settings.js` → `contact` |
| Shipping, returns, size guide, fabric & care text | `data/settings.js` |
| Page copy | `tools/build.py`, then run `python3 tools/build.py` |
| Colours and fonts | `css/main.css` (variables at the top) |

Logos: `assets/img/logo-pink*.png` (primary) and `assets/img/logo-black*.png` (alternative, used on Our Story). They are your original artwork with only the white background made transparent. `kiss.png` is the lip print taken from your pink logo, used as the decorative motif.

## What works today

- Cart: add/remove, quantity, size and colour, per-size stock limits, saved between visits.
- Shop: search, sort, filters (type, size, colour, price), URL-shareable filters, quick add.
- Product page: gallery, colour/size pickers, size guide, quantity, fabric & care, shipping, related products.

## What is NOT live yet (the site says so honestly)

1. **Checkout and payments.** The bag button reads "Checkout opens soon". No order or payment can happen until a platform is connected.
2. **Newsletter and contact form.** With no endpoint set, the site tells visitors their email has not been saved. Paste a form endpoint (Mailchimp, Klaviyo, Formspree) into `newsletterEndpoint` / `contactEndpoint` in `data/settings.js`.
3. **Accounts.** The account icon explains accounts arrive with the store platform.
4. **Products.** All six products are labelled placeholders with no prices. Prices show "Price TBC".
5. **"To be confirmed" tags** appear for shipping times/costs, returns and size measurements until you fill them in.
6. **Social links** currently point to the Instagram and TikTok home pages. Add your real profile URLs.

## Recommended platform: Shopify

For a small Australian handmade label, Shopify is the best fit: you manage products, photos, stock and prices in its dashboard (no code), and it provides secure checkout, AUD pricing, GST handling, Afterpay and card payments, Australia Post shipping rates, order emails and customer accounts.

Before accepting real orders:

1. Create the Shopify store, set currency to AUD, and add your products and photos.
2. Set up payments (Shopify Payments, plus Afterpay/PayPal if wanted), tax/GST, and shipping rates and returns policy.
3. Connect this front-end to Shopify's Storefront API (replace `data/products.js` with live product data and send the bag to Shopify checkout), or move the design into a Shopify theme. This is the next build step.
4. Set `checkout.mode` to `"shopify"` in `data/settings.js` and fill in the shipping and returns text.
5. Connect a newsletter service and add the contact email.

## Notes

- Fonts load from Google Fonts (Cormorant Garamond, Jost, Birthstone, Aref Ruqaa).
- SEO: pages have titles, descriptions and Open Graph tags; product pages add Product structured data. Product pages are built in the browser, so moving to Shopify will give stronger search results for individual products.
