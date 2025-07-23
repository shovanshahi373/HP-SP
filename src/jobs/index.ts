import path from "path";
import cron from "node-cron";

import { loadSecrets } from "../config/secretManager";
import init from "./initialize-discord";

const task = async () => {
  await loadSecrets();
  const topics = [
    globalThis.SECRETS.NTFY_TOPIC_BRAVE as string,
    globalThis.SECRETS.NTFY_TOPIC_EDGE as string,
  ];
  const filterKeyword = "====>";

  await init(
    "https://discord.com/channels/1362205838550237224/1372478920204746802",
    path.resolve(__dirname, "../../dist/bundle.js"),
    topics,
    "rejoin",
    (message: string) => {
      if (message.includes(filterKeyword)) {
        console.log("PAGE LOG>", message);
      }
    },
    // below are all args to rejoin
    filterKeyword,
    globalThis.SECRETS.VERSION,
    false
  );
};

task();
if (process.env.NODE_ENV === "production") {
  cron.schedule("*/15 * * * *", task);
}

export default {};
