import path from "path";
import puppeteer, { Page } from "puppeteer";
import cron from "node-cron";

import { loadSecrets } from "@/config/secretManager";
import { ICON_URL } from "@/constants";
import { create } from "@/services/notification";

const task = async () => {
  await loadSecrets();

  const { sendAlert } = create(globalThis.SECRETS.HYPE_PACKS_MINER);

  const filterKeyword = "====>";

  const visitURL = async (page: Page, topic: string) => {
    await page.setBypassCSP(true);
    await page.goto(
      "https://discord.com/channels/1362205838550237224/1372478920204746802"
    );
    try {
      await page.addScriptTag({
        path: path.resolve(__dirname, "../dist/bundle.js"),
      });
      await page.evaluate(
        (filterKeyword, topic, version) =>
          window["MyBundle"].rejoin(filterKeyword, topic, version, false),
        filterKeyword,
        topic,
        globalThis.SECRETS.VERSION
      );

      page.on("console", (msg) => {
        const text = msg.text();
        if (text.includes(filterKeyword)) {
          return console.log("PAGE LOG>", text);
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  const login = async (
    page: Page,
    credentials: { email: string; password: string }
  ) => {
    return new Promise<Page>(async (resolve) => {
      await page.goto("https://discord.com/login", {
        waitUntil: "networkidle2",
      });
      const isLoginPage = page.url().includes("login");
      if (!isLoginPage) {
        resolve(page);
      }
      await page.waitForSelector('input[name="email"]');
      await page.type('input[name="email"]', credentials.email);
      await page.type('input[name="password"]', credentials.password);

      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle2" }),
        page.click('button[type="submit"]'),
      ]);

      resolve(page);
    });
  };

  const browser = await puppeteer.launch({
    // headless: false,
    args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote"
    ],
    slowMo: 50,
    executablePath:
      process.env.NODE_ENV === "production"
        ? globalThis.SECRETS.PUPPETEER_EXEC_PATH
        : puppeteer.executablePath(),
  });

  const accounts = [
    {
      email: globalThis.SECRETS.DISCORD_EMAIL_1,
      password: globalThis.SECRETS.DISCORD_PASS_1,
    },
    {
      email: globalThis.SECRETS.DISCORD_EMAIL_2,
      password: globalThis.SECRETS.DISCORD_PASS_2,
    },
  ].filter((acc) => acc.email && acc.password);

  const topics = [
    globalThis.SECRETS.NTFY_TOPIC_BRAVE as string,
    globalThis.SECRETS.NTFY_TOPIC_EDGE as string,
  ];

  let topicIndex = 0;

  const results = await Promise.allSettled(
    accounts.map(async (acc) => {
      const page = await browser.newPage();
      return () => login(page, acc);
    })
  );

  results.map((result) => {
    if (result.status === "fulfilled") {
      const init = result.value;
      init()
        .then((page) => visitURL(page, topics[topicIndex++ % topics.length]))
        .catch((err) => {
          sendAlert({
            title: `Unable to load the page`,
            message: err?.message,
            icon: ICON_URL.SERVER_ERROR,
          });
        });
    }
    if (result.status === "rejected") {
      sendAlert({
        title: "Unable to load page",
        icon: ICON_URL.SERVER_ERROR,
      });
    }
  });
};

cron.schedule("0 */2 * * *", task);

export default {};
