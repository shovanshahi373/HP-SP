import fetch from "node-fetch";
import FormData from "form-data";

import { alertToTagMap, ICON_URL } from "../../constants";

import { Alert } from "../../types";

const url = "https://ntfy.sh";

export const create = (topic: string) => {
  return {
    sendAlert: (alert: Partial<Alert>) => {
      const tag =
        alertToTagMap[alert?.type as (typeof alertToTagMap)["error"]] ||
        "envelope_with_arrow";
      fetch(url, {
        method: "POST",
        body: JSON.stringify({
          topic,
          message: alert.message || "",
          title: alert.title || "",
          tags: [tag],
        }),
        headers: {
          Icon: alert.icon || "",
        },
      });
    },
    postMedia: (media: File, name: string, title: string) => {
      const form = new FormData();
      form.append("file", media); // key = "file"
      return fetch(`${url}/${topic}`, {
        method: "PUT",
        body: form,
        headers: {
          Title: title,
          Filename: name,
          Priority: "urgent",
          Icon: ICON_URL.POCKET,
        },
      });
    },
  };
};
