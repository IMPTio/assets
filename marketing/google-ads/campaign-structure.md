# IMPT Google Ads Campaign — Launch Tonight

## Strategy: Low Cost, High Conversion

**Approach:** Target bottom-of-funnel, high-intent keywords where users are ready to book.
Avoid broad generic terms (hotels, eco travel) — too expensive, too competitive.
Own the specific angle only IMPT has: carbon-verified booking + earn crypto rewards.

**Tonight's budget recommendation:** Start at €20–30/day across 3 ad groups.
Use Manual CPC to start (not Smart Bidding — you need 30 conversions first).
Target CPC: €0.15–0.50 per click for niche terms. €0.80–2.00 for hotel booking terms.

---

## Campaign 1: IMPT Brand Protection (€5/day)
**Goal:** Capture anyone searching for IMPT directly — cheapest clicks, highest intent.

### Keywords (Exact + Phrase match)
```
[impt.io]
[impt hotel]
[impt token hotel]
"impt booking"
"impt travel"
"impt carbon"
"book hotel impt"
```

### Ad Copy — Ad 1
**Headline 1:** IMPT — Book Hotels Worldwide
**Headline 2:** 1 Ton Carbon Removed Per Booking
**Headline 3:** Up to 45% Cashback on Hotels
**Description 1:** Book from 7M+ hotels at prices 16% below competitors. Every booking removes 1 ton of CO₂ automatically.
**Description 2:** Earn IMPT tokens. Stake for 8% APY + 50% of travel revenue. Start saving the planet tonight.
**Final URL:** https://impt.io/

---

## Campaign 2: Carbon Offset Hotel Booking (€10/day)
**Goal:** Capture eco-conscious travelers at point of booking decision.

### Keywords (Phrase + Broad Match Modifier)
```
"carbon neutral hotel booking"
"carbon offset hotel"
"eco hotel book online"
"sustainable hotel booking"
"green hotel booking"
"carbon neutral travel booking"
"book eco friendly hotel"
"hotel carbon credit"
"sustainable travel booking"
"eco conscious hotel"
```

### Negative Keywords (add these — saves budget)
```
-free
-DIY
-jobs
-course
-certification
-what is
-definition
-wiki
-reddit
-forum
```

### Ad Copy — Ad 1
**Headline 1:** Carbon Neutral Hotels — Book Now
**Headline 2:** 1 Ton CO₂ Removed Every Stay
**Headline 3:** 16% Cheaper Than Booking.com
**Description 1:** Search 7M+ eco-verified hotels worldwide. Your carbon footprint calculated and offset automatically at checkout.
**Description 2:** No extra cost. No manual steps. Just book — and IMPT handles the rest. Earn crypto rewards too.
**Final URL:** https://impt.io/impt-hotels-sustainable-stays-for-eco-conscious-travelers/

### Ad Copy — Ad 2
**Headline 1:** Book Hotels. Remove Carbon. Earn Crypto.
**Headline 2:** Verified Carbon Credits Per Booking
**Headline 3:** 7 Million Hotels — Best Rates
**Description 1:** IMPT automatically removes 1 ton of CO₂ per hotel booking. Blockchain-verified. No OTA markup.
**Description 2:** Earn IMPT tokens on every stay. Stake for 8% APY. The only platform where travel makes the planet better.
**Final URL:** https://impt.io/

---

## Campaign 3: Eco Hotel Search Intent (€10/day)
**Goal:** Capture users searching for eco hotels — redirect them to IMPT's advantage.

### Keywords
```
"eco friendly hotels near me"
"sustainable hotels"
"green hotels"
"environmentally friendly hotels"
"eco resort booking"
"best eco hotels"
"ethical hotel booking"
"zero carbon hotel"
"low carbon hotel stay"
```

### Negative Keywords
```
-tripadvisor
-booking.com
-airbnb
-expedia
-hostel
-camping
-free stay
-review
```

### Ad Copy — Ad 1
**Headline 1:** Eco Hotels — Verified Carbon Neutral
**Headline 2:** Book & Remove 1 Ton CO₂ Instantly
**Headline 3:** Prices 16% Below Competitors
**Description 1:** Don't just stay eco — verify it. Every IMPT booking is blockchain-certified carbon neutral. 7M+ hotels.
**Description 2:** Compare eco hotels worldwide. Automatic carbon offsetting. No greenwashing — real, verified impact.
**Final URL:** https://impt.io/eco-friendly-hotels-near-you-sustainable-stays-await/

### Ad Copy — Ad 2
**Headline 1:** Sustainable Hotels — Book Direct
**Headline 2:** Carbon Removed. Money Saved.
**Headline 3:** Up to 92% Off Hotel Rates
**Description 1:** IMPT finds you the best eco-certified hotel rates worldwide — averaging 16% below Booking.com and Expedia.
**Description 2:** Every booking offsets your carbon footprint automatically. Earn IMPT tokens as cashback. Start tonight.
**Final URL:** https://impt.io/impt-hotels-sustainable-stays-for-eco-conscious-travelers/

---

## Ad Extensions (Set These Up — Free Impressions)

### Sitelink Extensions
| Label | URL |
|---|---|
| Book a Hotel | https://impt.io/ |
| How It Works | https://impt.io/impt-travel-platform/ |
| Buy IMPT Token | https://impt.io/token/ |
| Investor Info | https://impt.io/investors/ |

### Callout Extensions
- 1 Ton CO₂ Removed Per Booking
- 16% Below Market Rates
- 7 Million Hotels Worldwide
- Blockchain Verified Carbon Credits
- Up to 45% Cashback
- 100+ Airlines Available

### Structured Snippets
**Header:** Destinations
**Values:** Europe, Asia, Africa, Americas, Middle East, Australia

---

## Conversion Tracking Setup

Before launching, set up these conversion actions in Google Ads:
1. **Hotel Search** — user searches on impt.io (micro-conversion)
2. **Booking Started** — user clicks "Book" (micro-conversion)
3. **Booking Completed** — confirmation page (primary conversion)
4. **Token Purchase** — /token/ page CTA click (secondary conversion)

Add this to the booking confirmation page:
```html
<!-- Google Ads Conversion Tag — paste on booking confirmation page -->
<script async src="https://www.googletagmanager.com/gtag/js?id=AW-XXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'AW-XXXXXXXXX');
  gtag('event', 'conversion', {
    'send_to': 'AW-XXXXXXXXX/XXXXXXXXX',
    'value': 1.0,
    'currency': 'EUR',
    'transaction_id': ''
  });
</script>
```
Replace `AW-XXXXXXXXX` with your actual Google Ads conversion ID.
