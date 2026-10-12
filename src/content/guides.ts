import { cities } from "./cities";
import type { Faq, OccasionId } from "./types";

/**
 * Search landing pages under /farmhouse-in-bhopal/… — one per occasion and per area.
 * Written for people searching Google ("farmhouse for birthday party in Bhopal",
 * "farmhouse on Kolar Road"…). Keep every claim true: no prices or counts we can't back up.
 */

export type Guide = {
  slug: string;
  kind: "occasion" | "area";
  /** H1 as [plain, italic] */
  h1: [string, string];
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  intro: string[];
  /** how people say it in Hindi/Hinglish, shown once and used in the meta keywords line */
  localPhrase?: string;
  checklistTitle: string;
  checklist: string[];
  tips: { title: string; body: string }[];
  faqs: Faq[];
  /** filters for listings once we launch */
  occasion?: OccasionId;
  area?: string;
  /** preselected in the early-access form */
  waitlistOccasion?: string;
  related: string[];
};

const bhopal = cities.find((c) => c.slug === "bhopal")!;

const howFaq: Faq = {
  group: "Booking",
  q: "How does booking a farmhouse through Farmhouze work?",
  a: "Send a free request with your date and guest count. We check with the owner (usually within 2 hours) and send you a quote. If you're happy, you pay a 30% advance by UPI to lock the date and get a booking pass with the exact address and caretaker's number. The balance is paid at the farmhouse.",
};
const priceFaq = (what: string): Faq => ({
  group: "Price",
  q: `How much does a farmhouse cost for ${what} in Bhopal?`,
  a: "It depends on the farmhouse, the number of guests, day or overnight, and the date — weekdays are often easier on the budget than weekends and festival dates. Tell us your plan and we'll get the owner's actual quote for your date, so you compare real prices instead of guesses. There's no booking fee from us.",
});
const musicFaq: Faq = {
  group: "Rules",
  q: "Till what time can we play music at a farmhouse near Bhopal?",
  a: "Outdoor music usually has to stop by 10 PM as per local rules. Indoor music after that depends on the farmhouse — each listing shows its own house rules.",
};

export const occasionGuides: Guide[] = [
  {
    slug: "birthday-party",
    kind: "occasion",
    h1: ["Farmhouse for a birthday party", "in Bhopal"],
    metaTitle: "Farmhouse for Birthday Party in Bhopal — Pool, Lawn & Bonfire",
    metaDescription: "Book a private farmhouse for a birthday party in Bhopal: lawn for the cake and games, pool for the kids, bonfire at night. Free requests, owner-confirmed availability.",
    eyebrow: "Birthdays",
    localPhrase: "Bhopal mein birthday ke liye farmhouse",
    intro: [
      "A farmhouse birthday works because the whole place is yours: a lawn for the cake and games, a pool to keep the kids busy all afternoon, and a bonfire when the sun goes down. No other parties next door, no hall manager watching the clock.",
      "Farmhouze checks farmhouses around Bhopal — Kerwa, Kolar Road, Bhadbhada, Neelbad, Bhojpur Road and Raisen Road — and confirms with the owner that your date is free before you pay anything.",
    ],
    checklistTitle: "What to check before you book",
    checklist: [
      "Guest count it can comfortably host, including parking for every car",
      "Pool depth and a shallow end if children are coming",
      "Power backup — a cake-cutting in the dark is not the plan",
      "Whether you can bring your own decorator, cake, caterer or DJ",
      "Music timing and the house rules on outside food and alcohol",
      "Clean washrooms and a changing room near the pool",
    ],
    tips: [
      { title: "Book a day-out slot for kids' parties", body: "A 9-to-6 day out covers pool time, lunch and the cake without paying for a night." },
      { title: "Go overnight for adult birthdays", body: "A night stay gives you the bonfire, the late conversations and breakfast together the next morning." },
      { title: "Lock weekends early", body: "Saturdays in the winter wedding season and around New Year fill up first. Send a request as soon as you know the date." },
    ],
    faqs: [priceFaq("a birthday party"), { group: "Planning", q: "Can we bring our own decorator and cake?", a: "Most farmhouses allow outside decorators, caterers and cakes. Each farmhouse page lists what's allowed, and we confirm it with the owner when we check your date." }, musicFaq, howFaq],
    occasion: "birthday",
    waitlistOccasion: "Birthday",
    related: ["pool-party", "day-out", "night-stay", "kolar-road"],
  },
  {
    slug: "pre-wedding-shoot",
    kind: "occasion",
    h1: ["Farmhouse for a pre-wedding shoot", "in Bhopal"],
    metaTitle: "Pre-Wedding Shoot Locations in Bhopal — Private Farmhouses",
    metaDescription: "Private farmhouses around Bhopal for pre-wedding and couple shoots: orchard rows, old gates, poolside and wide fields at golden hour. Book a shoot slot.",
    eyebrow: "Pre-wedding shoots",
    localPhrase: "pre wedding shoot location Bhopal",
    intro: [
      "Public spots around Bhopal are beautiful — and crowded. A private farmhouse gives you orchard rows, a verandah, a pool, an old gate and open fields in one place, with nobody walking through your frame and a room to change outfits.",
      "Tell us your shoot date and the look you want, and we'll find farmhouses that fit and confirm a slot with the owner.",
    ],
    checklistTitle: "What makes a good shoot farmhouse",
    checklist: [
      "Several distinct looks in one property — garden, verandah, pool, fields, gate",
      "A changing room with a mirror and power points for lights and steamers",
      "Light at golden hour: which side faces the sunset",
      "Permission for drones (ask before you fly)",
      "Parking for the crew's vehicles and equipment",
    ],
    tips: [
      { title: "Book the golden hour", body: "Plan to arrive 2–3 hours before sunset; the last hour gives the warmest light on the fields." },
      { title: "Bring outfit changes in order", body: "Start with the brightest outfit in daylight and keep the festive one for dusk and fairy lights." },
      { title: "Ask about a combined day", body: "Many couples pair the shoot with a family day out at the same farmhouse." },
    ],
    faqs: [{ group: "Shoots", q: "Can we shoot with a drone at a farmhouse?", a: "Often yes, but it's the owner's call and local drone rules apply. Mention it in your request and we'll confirm before you book." }, priceFaq("a pre-wedding shoot"), howFaq],
    occasion: "shoot",
    waitlistOccasion: "Shoot",
    related: ["haldi-mehendi", "small-wedding", "bhadbhada", "neelbad"],
  },
  {
    slug: "haldi-mehendi",
    kind: "occasion",
    h1: ["Farmhouse for haldi & mehendi", "in Bhopal"],
    metaTitle: "Farmhouse for Haldi & Mehendi in Bhopal — Lawn, Decor & Dhol",
    metaDescription: "Host your haldi or mehendi at a private farmhouse near Bhopal: open lawn for marigold decor, space for the dhol and family, rooms to get ready. Free requests.",
    eyebrow: "Haldi & mehendi",
    localPhrase: "haldi mehendi ke liye farmhouse Bhopal",
    intro: [
      "Haldi and mehendi are messy, loud and joyful — exactly why a farmhouse lawn beats a banquet hall. There's room for the marigold canopy, the dhol, the mehendi artists and every cousin, and nobody minds a little turmeric on the grass.",
      "We check availability with the owner for your date and confirm what your decorator and caterer can set up.",
    ],
    checklistTitle: "Plan the farmhouse around the ceremony",
    checklist: [
      "Open lawn size for the canopy, seating and dance area",
      "Rooms where the bride or groom can get ready",
      "Decorator access time the day before or the morning of",
      "Water and a hose nearby for haldi clean-up",
      "Power backup for lights, sound and fans",
      "Space to park the guests' cars",
    ],
    tips: [
      { title: "Haldi in the morning, mehendi by evening", body: "One day booking can cover both, with the mehendi under fairy lights after sunset." },
      { title: "Confirm the dhol and music timing", body: "Outdoor music usually stops by 10 PM — schedule the sangeet part accordingly." },
    ],
    faqs: [priceFaq("haldi or mehendi"), { group: "Planning", q: "Can our decorator set up the day before?", a: "Often yes. Mention it when you send the request and we'll confirm set-up timings with the owner." }, musicFaq, howFaq],
    occasion: "haldi-mehendi",
    waitlistOccasion: "Haldi & Mehendi",
    related: ["small-wedding", "pre-wedding-shoot", "raisen-road", "kolar-road"],
  },
  {
    slug: "small-wedding",
    kind: "occasion",
    h1: ["Farmhouse for a small wedding", "in Bhopal"],
    metaTitle: "Farmhouse Wedding Venue in Bhopal — Intimate Weddings",
    metaDescription: "Plan an intimate farmhouse wedding near Bhopal: a lawn for the mandap, rooms for close family to stay, and the whole property to yourselves. Free requests.",
    eyebrow: "Small weddings",
    localPhrase: "farmhouse wedding Bhopal",
    intro: [
      "An intimate wedding at a farmhouse feels like a family celebration rather than an event: the mandap on the lawn, close family staying over, and the whole property to yourselves for the day.",
      "Tell us your date, guest count and the functions you're planning. We shortlist farmhouses that can host it and confirm availability and the owner's terms before you commit.",
    ],
    checklistTitle: "Questions to settle early",
    checklist: [
      "Maximum guests for the ceremony and for dinner",
      "Number of rooms for family staying overnight",
      "Generator capacity for lights, sound and catering",
      "Whether outside caterers, decorators and pandit are allowed",
      "Parking, and a drop-off point for elders",
      "Rain backup — a covered hall or space for a tent",
    ],
    tips: [
      { title: "Visit before you pay", body: "For a wedding, see the farmhouse in person. We can arrange a visit once the date is confirmed free." },
      { title: "Book functions as one stay", body: "Haldi, mehendi and the wedding at one farmhouse saves moving the decor and the family every day." },
    ],
    faqs: [priceFaq("a small wedding"), { group: "Planning", q: "Can family stay at the farmhouse for the wedding?", a: "Yes, at farmhouses with rooms. Each listing shows bedrooms and how many it sleeps; we confirm extra beds with the owner." }, howFaq],
    occasion: "wedding",
    waitlistOccasion: "Small wedding",
    related: ["haldi-mehendi", "night-stay", "raisen-road", "bhojpur-road"],
  },
  {
    slug: "corporate-offsite",
    kind: "occasion",
    h1: ["Farmhouse for a corporate offsite", "near Bhopal"],
    metaTitle: "Corporate Offsite & Team Outing Farmhouses near Bhopal",
    metaDescription: "Take your team out of the office: private farmhouses near Bhopal for offsites, team outings and workshops — lawn sessions, Wi-Fi, meals and cricket.",
    eyebrow: "Corporate offsites",
    localPhrase: "team outing farmhouse Bhopal",
    intro: [
      "Strategy on the lawn, cricket after lunch, dinner by the fire — a farmhouse gets a team talking in a way a hotel conference room never does. Most of the areas we cover are 20–40 minutes from the city, so nobody spends the day on the road.",
      "Send us your headcount, date and what the day needs (Wi-Fi, a projector, meals, overnight rooms) and we'll confirm with farmhouses that fit.",
    ],
    checklistTitle: "Offsite essentials",
    checklist: [
      "Reliable Wi-Fi or mobile signal for the team",
      "A covered space with a projector or a big screen",
      "Power backup for laptops and the sound system",
      "Lunch and snacks arranged — or space for your caterer",
      "Open ground for team games",
      "Invoices for your accounts team",
    ],
    tips: [
      { title: "Pick a weekday", body: "Weekdays are calmer at farmhouses and easier to get on short notice." },
      { title: "Plan the day in two halves", body: "Work sessions before lunch while energy is high, games and a bonfire after." },
    ],
    faqs: [priceFaq("a corporate offsite"), { group: "Planning", q: "Can we get a bill for a company booking?", a: "Share your company name and billing details with the request and we'll confirm what kind of invoice is available for that booking before you pay." }, howFaq],
    occasion: "corporate",
    waitlistOccasion: "Offsite",
    related: ["day-out", "night-stay", "kolar-road", "bhadbhada"],
  },
  {
    slug: "day-out",
    kind: "occasion",
    h1: ["Farmhouse for a one-day picnic", "near Bhopal"],
    metaTitle: "Farmhouse on Rent for One Day in Bhopal — Day Picnic",
    metaDescription: "Rent a private farmhouse near Bhopal for one day: pool, lawn, indoor games and a kitchen, roughly 9 AM to 6 PM. Ideal for family and friends' day outs.",
    eyebrow: "Day outs",
    localPhrase: "1 din ke liye farmhouse Bhopal",
    intro: [
      "Not every escape needs a night away. A day out at a farmhouse — usually from morning till evening — gives you the pool, the lawn, the games and a long lunch under the trees, and you're home by dinner.",
      "It's the easiest way to try a farmhouse with family or friends. Pick a date, tell us how many of you are coming, and we'll check what's free.",
    ],
    checklistTitle: "Make the most of a day out",
    checklist: ["Arrive early — mornings by the pool are the best part", "Check if you can cook or must bring food", "Ask for the pool timings and towels", "Carry sunscreen, a speaker and a cricket bat", "Confirm the check-out time so nobody's rushed"],
    tips: [
      { title: "Weekdays are the sweet spot", body: "Far quieter, and easier to book at short notice." },
      { title: "Bring the elders too", body: "Shaded seating and a short drive from the city make it easy for every age." },
    ],
    faqs: [priceFaq("a one-day picnic"), { group: "Timing", q: "What are the usual day-out timings?", a: "Around 9 AM to 6 PM, but every farmhouse sets its own — it's shown on each listing and confirmed when we check your date." }, howFaq],
    occasion: "day-out",
    waitlistOccasion: "Day out",
    related: ["pool-party", "birthday-party", "kerwa", "bhadbhada"],
  },
  {
    slug: "night-stay",
    kind: "occasion",
    h1: ["Farmhouse stay near Bhopal", "for a night or a weekend"],
    metaTitle: "Farmhouse Stay near Bhopal — Overnight & Weekend Getaways",
    metaDescription: "Stay overnight at a private farmhouse near Bhopal: bonfire nights, stars, fresh air and breakfast in the fields. Night stays and weekend escapes, owner-confirmed.",
    eyebrow: "Night stays & weekends",
    localPhrase: "Bhopal ke paas farmhouse stay",
    intro: [
      "An overnight stay is when a farmhouse really slows you down: the bonfire, the stars you can't see in the city, and chai on the porch the next morning while the fields wake up.",
      "Go for one night, or take the whole weekend. We check your dates with the owner and send you a quote before you pay anything.",
    ],
    checklistTitle: "Before you stay",
    checklist: ["Number of bedrooms and how many it sleeps", "AC, hot water and fresh linen", "Whether a cook or breakfast can be arranged", "Check-in and check-out times", "ID for every adult staying overnight"],
    tips: [
      { title: "Two nights beat one", body: "A weekend escape means a full day at the farm in between, without packing up." },
      { title: "Ask for a bonfire", body: "Most farmhouses can set one up — mention it in your request." },
    ],
    faqs: [priceFaq("an overnight stay"), { group: "Stay", q: "Is a farmhouse stay safe for families?", a: "Every farmhouse is visited before we list it, and your booking pass includes the exact address and the caretaker's or owner's number, so someone is always reachable." }, howFaq],
    occasion: "night-stay",
    waitlistOccasion: "Night stay",
    related: ["new-year-party", "day-out", "kerwa", "bhojpur-road"],
  },
  {
    slug: "pool-party",
    kind: "occasion",
    h1: ["Farmhouse with a swimming pool", "in Bhopal"],
    metaTitle: "Farmhouse with Swimming Pool in Bhopal — Private Pool Parties",
    metaDescription: "Private farmhouses with a swimming pool near Bhopal for pool parties, family days and summer escapes. The pool and the lawn are yours alone.",
    eyebrow: "Pool farmhouses",
    localPhrase: "swimming pool wala farmhouse Bhopal",
    intro: [
      "In a Bhopal summer, the pool is the whole point. A private farmhouse pool means no crowds, no timing slots shared with strangers, and the music you want — then a lawn and shade for when you finally get out.",
      "We note pool size, depth and a kids' end for every farmhouse we list, and confirm the pool's clean and ready for your date.",
    ],
    checklistTitle: "Check the pool, not just the photos",
    checklist: ["Pool size and depth — is there a shallow end?", "When it was last cleaned and how often", "Changing rooms and showers nearby", "Shade and seating around the pool", "Lifeguard or adult supervision for children"],
    tips: [
      { title: "Go early in summer", body: "From April to June, pool farmhouses are the first to book out." },
      { title: "Keep glass away from the water", body: "Most owners ask for plastic glasses around the pool — pack them." },
    ],
    faqs: [priceFaq("a pool party"), { group: "Pool", q: "Is the pool private?", a: "Yes. When you book a farmhouse through us, the whole property — including the pool — is only for your group." }, howFaq],
    occasion: "day-out",
    waitlistOccasion: "Day out",
    related: ["birthday-party", "day-out", "kolar-road", "neelbad"],
  },
  {
    slug: "kitty-party",
    kind: "occasion",
    h1: ["Farmhouse for a kitty party", "in Bhopal"],
    metaTitle: "Farmhouse for Kitty Party in Bhopal — A Day Out for Your Group",
    metaDescription: "Take your kitty party to a private farmhouse near Bhopal: lunch on the lawn, games, music and photos — a day out instead of the usual restaurant.",
    eyebrow: "Kitty parties",
    localPhrase: "kitty party ke liye farmhouse",
    intro: [
      "Swap the usual restaurant for a farmhouse: a long lunch on the lawn, games and music without other tables around, and plenty of photo spots. It's a day out the whole group talks about.",
      "Tell us your date and group size and we'll find a farmhouse that suits — including easy parking and a short drive from your side of the city.",
    ],
    checklistTitle: "Make it easy for everyone",
    checklist: ["Short drive from where most members live", "Shaded seating and clean washrooms", "Space for games and a speaker", "Food arrangement — cook on site or your caterer", "Photo spots: garden, verandah, fields"],
    tips: [{ title: "Pick a weekday", body: "Kitty parties often meet on weekdays, when farmhouses are quieter and easier to book." }],
    faqs: [priceFaq("a kitty party"), howFaq],
    occasion: "day-out",
    waitlistOccasion: "Day out",
    related: ["day-out", "birthday-party", "bhadbhada", "kolar-road"],
  },
  {
    slug: "new-year-party",
    kind: "occasion",
    h1: ["Farmhouse for a New Year party", "near Bhopal"],
    metaTitle: "New Year Party Farmhouse near Bhopal — Book Early",
    metaDescription: "Ring in the New Year at a private farmhouse near Bhopal with your own group: bonfire, music, stars and a stay over. New Year's Eve books out early.",
    eyebrow: "New Year's Eve",
    localPhrase: "New Year party farmhouse Bhopal",
    intro: [
      "New Year's Eve is one of the busiest nights of the year at farmhouses around Bhopal — a bonfire, your own music, your own people, and no club queues. It is also one of the first dates to go.",
      "Join the early-access list or send a request now with your group size; we'll check with owners well before the rush.",
    ],
    checklistTitle: "Plan New Year's Eve properly",
    checklist: ["Overnight stay so nobody drives after midnight", "Bonfire and warm seating for a December night", "Music rules — indoor music after 10 PM depends on the farmhouse", "Food and a cook, or your caterer", "Number of beds for everyone staying"],
    tips: [{ title: "Book by early December", body: "Popular farmhouses are often booked weeks ahead of 31 December." }, { title: "Stay two nights", body: "Arrive on the 31st and leave on the 2nd — a slow 1 January at the farm is the best part." }],
    faqs: [priceFaq("New Year's Eve"), musicFaq, howFaq],
    occasion: "night-stay",
    waitlistOccasion: "Night stay",
    related: ["night-stay", "birthday-party", "kerwa", "raisen-road"],
  },
];

const areaCopy: Record<string, { goodFor: string[]; extra: string; related: string[] }> = {
  kerwa: { goodFor: ["Night stays and weekends", "Bonfire evenings", "Pre-wedding shoots with a forest backdrop"], extra: "Green and quiet, with cooler evenings than the city — a favourite for overnight stays.", related: ["night-stay", "pre-wedding-shoot", "bhadbhada", "neelbad"] },
  "kolar-road": { goodFor: ["Birthday parties", "Bigger groups", "Corporate offsites"], extra: "One of the easiest areas to reach from the city, with room for larger gatherings.", related: ["birthday-party", "corporate-offsite", "kerwa", "bhojpur-road"] },
  bhadbhada: { goodFor: ["Day outs", "Kitty parties", "Sunset evenings"], extra: "Among the closest farmhouse areas to the city, near the Upper Lake side — handy for a day out.", related: ["day-out", "kitty-party", "kerwa", "neelbad"] },
  neelbad: { goodFor: ["Orchard day outs", "Pre-wedding shoots", "Family get-togethers"], extra: "Mango orchards and farm lanes on the western side of Bhopal.", related: ["pre-wedding-shoot", "day-out", "bhadbhada", "kerwa"] },
  "bhojpur-road": { goodFor: ["Weekend escapes", "Open-sky bonfires", "Small weddings"], extra: "Open fields and big skies on the way towards Bhojpur.", related: ["night-stay", "small-wedding", "raisen-road", "kolar-road"] },
  "raisen-road": { goodFor: ["Weddings and haldi", "Large celebrations", "Weekend stays"], extra: "Green belts on the eastern edge of the city, good for bigger functions.", related: ["small-wedding", "haldi-mehendi", "bhojpur-road", "kolar-road"] },
};

export const areaGuides: Guide[] = bhopal.areas.map((a) => {
  const c = areaCopy[a.slug];
  return {
    slug: a.slug,
    kind: "area",
    h1: [`Farmhouses in ${a.name},`, "Bhopal"],
    metaTitle: `Farmhouse in ${a.name}, Bhopal — Day Outs, Stays & Parties`,
    metaDescription: `Private farmhouses in ${a.name}, about ${a.kmFromCentre} km (${a.driveTime}) from New Market, Bhopal. ${a.blurb} Free requests, owner-confirmed availability.`,
    eyebrow: `${a.name} · ${a.kmFromCentre} km · ${a.driveTime}`,
    localPhrase: `${a.name} farmhouse Bhopal`,
    intro: [`${a.blurb} ${c?.extra ?? ""}`.trim(), `${a.name} is about ${a.kmFromCentre} km from New Market — roughly ${a.driveTime} by car. Tell us your date and plan, and we'll check which farmhouses here are free and confirm with the owners.`],
    checklistTitle: `${a.name} is good for`,
    checklist: c?.goodFor ?? [],
    tips: [
      { title: "Exact address after booking", body: "To protect owners' privacy we show the area and drive time; the exact address and directions come with your booking pass." },
      { title: "Leave before dark on the way back", body: "Farm lanes can be unlit — plan the drive home before late evening, or stay the night." },
    ],
    faqs: [{ group: "Area", q: `How far is ${a.name} from Bhopal city?`, a: `About ${a.kmFromCentre} km from New Market, usually ${a.driveTime} by car depending on traffic.` }, priceFaq(`a farmhouse in ${a.name}`), howFaq],
    area: a.slug,
    related: c?.related ?? [],
  };
});

export const guides: Guide[] = [...occasionGuides, ...areaGuides];
export const getGuide = (slug: string) => guides.find((g) => g.slug === slug);
export const GUIDE_BASE = "/farmhouse-in-bhopal";
