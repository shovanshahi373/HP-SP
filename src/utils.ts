export const getFormattedElapsedTime = (seconds: number) => {
  const secs = (seconds % 60).toString().padStart(2, "0");
  const minutes = (Math.floor(seconds / 60) % 60).toString().padStart(2, "0");
  const hours = (Math.floor(seconds / (60 * 60)) % 24)
    .toString()
    .padStart(2, "0")
    .toString()
    .padStart(2, "0");
  const days = Math.floor(seconds / (60 * 60 * 24));
  return `${
    days ? `${days}`.padStart(2, "0").concat("d") : ""
  }${hours}h:${minutes}m:${secs}s`;
};

export const downloadImageFromUrl = async (url: string, name: string) => {
  return fetch(url)
    .then((res) => res.blob())
    .then((blob) => {
      const file = new File([blob], name, {
        type: blob.type,
      });
      return file;
    })
    .catch((err) => {
      console.error("error downloading image:", err);
      throw err;
    });
};

export const getExtension = (filename: string) => {
  const start = filename.lastIndexOf(".");
  const end = filename.lastIndexOf("?");
  if (start === -1) return "";
  if (end !== -1) {
    return filename.slice(start + 1, end);
  }
  return filename.slice(start + 1);
};

export const formatFieldName = (str: string) => {
  return str.trim().replace(":", "").replace(/\s+/g, "_").toLowerCase();
};

export const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(undefined);
    }, ms);
  });
