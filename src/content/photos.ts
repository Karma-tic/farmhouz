/**
 * Real photographs standing in until the farmhouses are shot.
 *
 * All from Unsplash under the Unsplash License (free for commercial use, no
 * permission needed; Unsplash+ images excluded). They show the kind of place
 * and moment we mean, not a listed farmhouse — the footer says so in one line.
 * Swap any entry for a real farm photo (local `/media/...` path or Vercel Blob
 * URL) and drop the `credit`; the footer credit disappears once none are left.
 *
 * Served through next/image from images.unsplash.com (see next.config.ts —
 * the `search` string below must match the one allowed there).
 */
import type { Media } from "./types";

export const UNSPLASH_SEARCH = "?w=2400&q=80";

const u = (id: string, alt: string, credit: string): Media => ({
  src: `https://images.unsplash.com/${id}${UNSPLASH_SEARCH}`,
  alt,
  credit,
});

export const photos = {
  // places
  farmhouse: u("photo-1641188721985-a090d0577e24", "Red-roofed farmhouse in a green field", "Tony Sebastian"),
  farmhousePalms: u("photo-1666154728591-b568cd00cb4c", "Farmhouse among palm trees under a blue sky", "Haren Asher"),
  lawn: u("photo-1636301587190-88cbb412fea0", "House behind a wide green lawn and trees", "Tania Melnyczuk"),
  orchard: u("photo-1781673232370-ece15536d3d3", "Green mangoes hanging in an orchard", "Rizwan ullah"),
  mango: u("photo-1781414295977-9cf3c4df428b", "A single green mango on the branch", "Mr Cool Hitman"),
  pool: u("photo-1596178067639-5c6e68aea6dc", "Private pool beside a whitewashed house and palms", "The Anam"),
  poolAerial: u("photo-1728048756938-de1ccee0ab15", "Pool and house seen from above, wrapped in greenery", "Antonio Araujo"),
  poolFeet: u("photo-1786676676204-ce18ed9f1fcd", "Feet dipped in a swimming pool", "Ahmet Yüksek"),
  bedroom: u("photo-1601276174812-63280a55656e", "Bedroom with white linen and morning light", "Liz Vo"),
  stars: u("photo-1624921938155-48a9a341d501", "House lit up under a starry night sky", "Brad Switzer"),
  // nature
  mist: u("photo-1595433306946-233f47e4af3a", "Morning mist over green fields and hills", "Remi Clinton"),
  sunset: u("photo-1665756868729-a39725b62c47", "Sunset over fields and trees", "Antonio Lapa"),
  peacock: u("photo-1536514900905-0d5511b9d489", "Peacock with its feathers fanned out", "ricardo frantz"),
  chai: u("photo-1761483281417-778013dc0177", "Chai poured into clay kulhads", "AJOY DAS"),
  // moments
  bonfire: u("photo-1568494354623-3d36e8d537b4", "Friends around a bonfire at night", "Cailin Grant-Jansen"),
  bonfireCircle: u("photo-1568785919846-27fd1c8f8982", "A circle of friends around a campfire", "Kevin Wolf"),
  fire: u("photo-1543005472-1b1d37fa4eae", "Logs burning in a bonfire", "Maxim Tajer"),
  stringLights: u("photo-1574482211311-45a2169db57c", "Dinner under trees strung with lights", "Matthew Buchanan"),
  stringLightsPath: u("photo-1773797175918-280600f94452", "String lights glowing over an evening garden", "David Trinks"),
  party: u("photo-1517456793572-1d8efd6dc135", "Friends gathered at an evening party", "Samantha Gades"),
  boardGames: u("photo-1677188010559-0667a1ed33a0", "Friends over a board game", "2H Media"),
  team: u("photo-1760638260981-2af5fc0c9c57", "A team celebrating together outdoors", "sayan Nath"),
  shoot: u("photo-1702221294069-1170957f0f15", "Poolside portrait shoot", "Oleg Brovchenko"),
  // weddings
  haldi: u("photo-1681717075175-19feb7a6f664", "Bride in a yellow sari holding a marigold garland", "Arun Prakash"),
  haldiColour: u("photo-1681717166573-f71589207785", "Haldi ceremony, turmeric and water flying", "Arun Prakash"),
  mandap: u("photo-1772127822562-a898d9f5733c", "Outdoor wedding ceremony set up with floral decor", "Vidit Goswami"),
  mandapAisle: u("photo-1772127822552-ce9ef537bdcf", "Floral wedding arch and aisle on a lawn", "Vidit Goswami"),
  mehendi: u("photo-1556536088-f010a312a8d3", "Hands covered in fresh mehendi", "Nijwam Swargiary"),
  couple: u("photo-1735052712464-9d24b69be5f5", "Bride and groom on a tree-lined path", "iKshana Productions"),
  coupleWoods: u("photo-1635481728744-086dc12ceaf5", "Couple portrait among the trees", "RUPAM DUTTA"),
} satisfies Record<string, Media>;

/** Photographers credited in the footer while any stand-in photo is in use. */
export const photoCredits = [...new Set(Object.values(photos).map((p) => p.credit!))];
