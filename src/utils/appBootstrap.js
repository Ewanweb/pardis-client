import { api } from "../services/api";

const withTimeout = (promise, timeoutMs) =>
  new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), timeoutMs);

    promise
      .then((response) => {
        clearTimeout(timer);
        resolve(response);
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(null);
      });
  });

export const waitForFonts = () => {
  const root = document.documentElement;

  if (!document?.fonts?.ready) {
    root.classList.add("fonts-loaded");
    return Promise.resolve();
  }

  return document.fonts.ready
    .then(() => {
      root.classList.add("fonts-loaded");
    })
    .catch(() => {
      root.classList.add("fonts-failed");
    });
};

export const preloadEssentialData = async () => {
  const timeoutMs = 2000;

  const requests = [
    withTimeout(api.get("/Home/Categories"), timeoutMs),
    withTimeout(api.get("/Home/Instructors"), timeoutMs),
  ];

  await Promise.all(requests);
};
