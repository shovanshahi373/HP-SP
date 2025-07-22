export {};

declare global {
  interface GlobalThis {
    SECRETS: {
      DISCORD_EMAIL_1: string;
      DISCORD_EMAIL_2: string;
      DISCORD_PASS_1: string;
      DISCORD_PASS_2: string;
      HYPE_PACKS_MINER: string;
      NTFY_TOPIC_BRAVE: string;
      NTFY_TOPIC_EDGE: string;
      VERSION: string;
    };
  }
}
