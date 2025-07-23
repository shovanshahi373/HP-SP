import puppeteer, { Page } from "puppeteer";

import { ICON_URL } from "../constants";
import { create } from "../services/notification";

const init = async (
  redirect: string,
  scriptUrl: string,
  topics: string[],
  scope: string,
  ...args: any[]
) => {
  const { sendAlert } = create(globalThis.SECRETS.HYPE_PACKS_MINER);

  const visitURL = async (page: Page, topic: string) => {
    await page.setBypassCSP(true);
    await page.goto(redirect);
    try {
      await page.addScriptTag({
        path: scriptUrl,
      });
      await page.evaluate(
        (topic, scope, ...args) => window["MyBundle"][scope](topic, ...args),
        topic,
        scope,
        ...args
      );

      page.on("console", (msg) => {
        const text = msg.text();
        return console.log("PAGE LOG>", text);
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
    // args: [
    //   "--disable-setuid-sandbox",
    //   "--no-sandbox",
    //   "--single-process",
    //   "--no-zygote",
    // ],
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
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

export default init;
