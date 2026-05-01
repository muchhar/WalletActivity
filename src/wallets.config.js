// ============================================================
//  WALLET CONFIGURATION
//  Categories: "sports" | "weather" | "crypto" | "mixed"
//  Addresses are normalized to lowercase (Polygon/Polymarket are
//  case-insensitive for addresses).
// ============================================================

const wallets = [
  // ---------- SPORTS ----------
  {
    label: "0x006c…c16ea",
    address: "0x006cc834cc092684f1b56626e23bedb3835c16ea",
    category: "sports",
  },
  {
    label: "RN1",
    address: "0x2005d16a84ceefa912d4e380cd32e7ff827875ea",
    category: "sports",
  },
  {
    label: "0p0jogggg",
    address: "0x6ac5bb06a9eb05641fd5e82640268b92f3ab4b6e",
    category: "sports",
  },
  {
    label: "Cigarettes",
    address: "0xd218e474776403a330142299f7796e8ba32eb5c9",
    category: "sports",
  },
  {
    label: "sovereign2013",
    address: "0xee613b3fc183ee44f9da9c05f53e2da107e3debf",
    category: "sports",
  },
  {
    label: "lstxx",
    address: "0x04a39d068f4301195c25dcb4c1fe5a4f08a65213",
    category: "sports",
  },
  {
    label: "sunnyboy",
    address: "0xbb0bd109b9f0c2a59b8819c466f064cf65ab3790",
    category: "sports",
  },

  // ---------- WEATHER ----------
  {
    label: "0x9d3e…c49e",
    address: "0x9d3e989dd42030664e6157dae42f6d549542c49e",
    category: "weather",
  },
  {
    label: "protrade",
    address: "0x4b6a56330c1775468ed93db9ef4be662345cdb19",
    category: "weather",
  },

  // ---------- CRYPTO ----------
  {
    label: "BoshBashBish",
    address: "0x29bc82f761749e67fa00d62896bc6855097b683c",
    category: "crypto",
  },
  {
    label: "filthyBera",
    address: "0x8a091656e5f4c6bc4fdf37b2585be0235f68e317",
    category: "crypto",
  },
  {
    label: "BoneReader",
    address: "0xd84c2b6d65dc596f49c7b6aadd6d74ca91e407b9",
    category: "crypto",
  },
  {
    label: "Pbot1",
    address: "0x88f46b9e5d86b4fb85be55ab0ec4004264b9d4db",
    category: "crypto",
  },
  {
    label: "abrak25",
    address: "0x37c94ea1b44e01b18a1ce3ab6f8002bd6b9d7e6d",
    category: "crypto",
  },
  {
    label: "vidarx",
    address: "0x2d8b401d2f0e6937afebf18e19e11ca568a5260a",
    category: "crypto",
  },

  // ---------- MIXED ----------
  {
    label: "rwo",
    address: "0xd189664c5308903476f9f079820431e4fd7d06f4",
    category: "mixed",
  },
  {
    label: "0x8dxd",
    address: "0x63ce342161250d705dc0b16df89036c8e5f9ba9a",
    category: "mixed",
  },


  {
    label: "LaBradfordSmith22",
    address: "0x9495425feeb0c250accb89275c97587011b19a27",
    category: "Sports",
  },
  {
    label: "Tiger200",
    address: "0x6211f97a76ed5c4b1d658f637041ac5f293db89e",
    category: "Sports",
  },
  {
    label: "BBPK",
    address: "0xbddf61af533ff524d27154e589d2d7a81510c684",
    category: "Sports",
  },
  {
    label: "Handsanitizer23",
    address: "0x05e70727a2e2dcd079baa2ef1c0b88af06bb9641",
    category: "Weather",
  },
  {
    label: "ColdMath",
    address: "0x594edb9112f526fa6a80b8f858a6379c8a2c1c11",
    category: "Weather",
  }
];

// ---------- Category metadata (for UI / colors / icons) ----------
export const CATEGORIES = {
  sports:  { label: "Sports",  color: "#ff9f1c", icon: "⚽" },
  weather: { label: "Weather", color: "#58a6ff", icon: "☁" },
  crypto:  { label: "Crypto",  color: "#bd93f9", icon: "◈" },
  mixed:   { label: "Mixed",   color: "#8b949e", icon: "◆" },
};

export default wallets;
