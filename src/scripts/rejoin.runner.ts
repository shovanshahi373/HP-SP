import { create } from "../services/notification";

import { ALERTS, ICON_URL, PACK_PROPS } from "../constants";

import {
  downloadImageFromUrl,
  formatFieldName,
  getExtension,
  getFormattedElapsedTime,
  sleep,
} from "../utils";

export const rejoin = (
  topic: string,
  filterKeyword: string,
  version: string,
  debug: boolean = false
) => {
  const { postMedia, sendAlert } = create(topic);
  let currentObservation = 0;
  let previousObservation = 0;
  let runTime = 0;
  const packHistorySizeLimit = 30;
  const joinRate = 500; // half a second
  const maxJoinThreshold = 99;
  const attributeName = "aria-hidden";
  let lastSeenTime = "";
  let packHistory: string[] = [];
  let intervals: NodeJS.Timeout[] = [];

  const updatePackHistory = (items: string[]) => {
    const newHistory = [...new Set([...packHistory, ...items])];
    const newSize = newHistory.length;
    if (newSize > packHistorySizeLimit) {
      packHistory = newHistory.slice(-packHistorySizeLimit);
    } else {
      packHistory = newHistory;
    }
  };

  const customLogger = (...messages: any[]) => {
    const time = getFormattedElapsedTime(runTime);
    console.log(`${filterKeyword} ${version} | runtime - ${time}\n`);
    console.log(...messages, filterKeyword);
  };

  const isNewSeenPack = (id: string) => {
    return !packHistory.includes(id);
  };

  const safeSetInterval = (fn, ms) => {
    const id = setInterval(fn, ms);
    intervals.push(id);
    return id;
  };

  const clearAll = () => {
    intervals.forEach(clearInterval);
    intervals = [];
  };

  sendAlert({
    title: "script was (re)started",
    icon: ICON_URL.SERVER,
    type: ALERTS.INFO,
  });
  try {
    const join = () => {
      const container = document.querySelector(".messagesWrapper__36d07");
      const items = [
        ...(container || document).querySelectorAll(
          "article:has(.embedThumbnail__623de)"
        ),
      ];

      currentObservation = items.length;
      const properties = items
        .map((item) => {
          const fields = item.querySelector(".embedFields__623de");
          const url = item
            .querySelector(".originalLink_af017a")
            .getAttribute("href");
          const button: HTMLButtonElement =
            item.nextElementSibling.querySelector(
              "button.lookFilled__201d5.colorGreen__201d5"
            );
          const props = [
            ...fields.querySelectorAll(".embedField__623de"),
          ].reduce((acc, field) => {
            const name = (
              field.querySelector(".embedFieldName__623de") as HTMLButtonElement
            ).innerText;
            const value = (
              field.querySelector(
                ".embedFieldValue__623de"
              ) as HTMLButtonElement
            ).innerText;

            return {
              ...acc,
              [formatFieldName(name)]: value,
            };
          }, {});
          return {
            props,
            url,
            button,
          };
        })
        .filter((item) => {
          return (
            !(item.props[PACK_PROPS.SHARES_IN] || "").includes("ago") &&
            parseInt(item.props[PACK_PROPS.PEOPLE_JOINED] || 0) <
              maxJoinThreshold
          );
        })
        .reverse();

      if (debug) {
        console.log(filterKeyword, properties);
      }

      const onClickButton = (buttonIndex: number) => {
        let observer = null;
        return new Promise<{ props: {}; url: string }>((resolve, reject) => {
          try {
            const button = properties[buttonIndex]?.button;
            const props = properties[buttonIndex]?.props || {};
            const url = properties[buttonIndex]?.url || "";
            if (!button) {
              observer?.disconnect();
              resolve({ props: { ...props }, url });
            }
            const buttonContent = button.querySelector(".content__57f77");
            const ishiddenText = buttonContent.getAttribute(attributeName);
            button.click();
            observer = new MutationObserver((mutationsList) => {
              for (const mutation of mutationsList) {
                const bool =
                  mutation.type === "attributes" &&
                  mutation.attributeName === attributeName &&
                  (mutation.target as HTMLElement).getAttribute(
                    attributeName
                  ) === ishiddenText;
                if (bool) {
                  customLogger(
                    "join request complete, now targeting next join..."
                  );
                  observer?.disconnect();
                  resolve({ props: { ...props }, url });
                }
              }
            });
            observer?.observe(buttonContent, {
              attributes: true,
            });
          } catch (err) {
            observer?.disconnect();
            reject(err);
          }
        });
      };

      Promise.allSettled(
        Array.from({ length: properties.length }, (_v, i) =>
          sleep(i * 100).then(() => onClickButton(i))
        )
      )
        .then((res) =>
          res
            .filter((item) => item.status === "fulfilled")
            .map((item) => item.value)
        )
        .then((res) => {
          if (currentObservation > previousObservation) {
            // new pack was just seen
            lastSeenTime = new Date().toLocaleString();

            const uniquePacks = res.filter((item) =>
              isNewSeenPack(item.props[PACK_PROPS.ID])
            );

            updatePackHistory(
              uniquePacks.map((item) => item.props[PACK_PROPS.ID])
            );
            // writeToStorage(packHistory);

            const promises = Promise.allSettled(
              uniquePacks.map((item) =>
                downloadImageFromUrl(
                  item.url,
                  `${item.props[PACK_PROPS.NICKNAME]}.${
                    getExtension(item.url) || "jpg"
                  }`
                ).then((file) => ({
                  ...item,
                  file,
                }))
              )
            );

            promises
              .then((res) => {
                return res
                  .filter((item) => item.status === "fulfilled")
                  .map((item) => item.value);
              })
              .then((res) => {
                return Promise.allSettled(
                  res.map((item) =>
                    postMedia(
                      item.file,
                      item.file.name,
                      "New Special Pack Alert"
                    )
                  )
                );
              });
          }
          if (res.length === 0) {
            customLogger(
              `no special packs were seen ${
                lastSeenTime ? `since ${lastSeenTime}` : ""
              }...💤💤💤`
            );
          } else {
            customLogger(
              `✅ completed joining ${res.length} out of ${currentObservation} pack(s)`
            );
          }
          customLogger({ packHistory });
          previousObservation = currentObservation;
          properties.length = 0;
          setTimeout(join, joinRate);
        })
        .catch((err) => {
          sendAlert({
            title: "an error occurred, reloading the page",
            message: err.message,
            type: ALERTS.ERROR,
          });
          clearAll();
          window.location.reload();
        });
    };

    join();

    safeSetInterval(() => {
      const dismiss = [
        ...document.querySelectorAll(".messagesWrapper__36d07 .anchor_edefb8"),
      ] as HTMLButtonElement[];
      dismiss.forEach((d) => {
        if (d.innerText.includes("Dismiss message")) {
          d?.click?.();
        }
      });
    }, 5000);

    safeSetInterval(() => console.clear(), 1000 * 60 * 5);

    safeSetInterval(() => {
      runTime += 1;
    }, 1000);

    window.addEventListener("beforeunload", clearAll);
  } catch (error) {
    customLogger(error);
    sendAlert({
      title: "An error occurred while trying to join",
      message: error?.message,
    });
  }
};
