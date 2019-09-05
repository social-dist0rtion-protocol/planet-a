export const voltConfig = {
  CONTRACT_VOICE_CREDITS: "0x8f8FDcA55F0601187ca24507d4A1fE1b387Db90B",
  CONTRACT_VOICE_TOKENS: "0x3442c197cc858bED2476BDd9c7d4499552780f3D",
  CONTRACT_VOICE_BALANCE_CARD: "0xCD1b3a9a7B5f84BC7829Bc7e6e23adb1960beE97",
  BALANCE_CARD_COLOR: "49159",
  VOICE_CREDITS_COLOR: "4",
  VOICE_TOKENS_COLOR: "5",
  // Both BallotBox and VotingBooth spendies should have multiple VOT utxos 
  // each at least MIN_SIZE_FOR_VOT_UTXO size. This is done by consolidation script (@kosta)
  MIN_SIZE_FOR_VOT_UTXO: 5, // 5 tokens (25 voice credits)
  MIN_SIZE_FOR_LEAP_UTXO: 0.00001
};
