/** Private owner & caretaker details — never sent to visitors' browsers. */
export type OwnerInfo = {
  ownerName: string;
  /** digits with country code, e.g. 919876543210 */
  ownerWhatsapp: string;
  caretakerName: string;
  caretakerPhone: string;
  exactAddress: string;
  mapsUrl: string;
  /** your private notes: commission, payout terms, quirks */
  notes?: string;
};
