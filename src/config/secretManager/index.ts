import { InfisicalSDK } from "@infisical/sdk";

import { INFISICAL_ENV } from "../../constants";

const client = new InfisicalSDK({
  siteUrl: process.env.INFISICAL_SITE_URL, // Optional, defaults to https://app.infisical.com
});

export const loadSecrets = async () => {
  // Authenticate with Infisical
  const c = await client.auth().universalAuth.login({
    clientId: process.env.INFISICAL_CLIENT_ID!,
    clientSecret: process.env.INFISICAL_CLIENT_SECRET!,
  });
  const { secrets } = await c.secrets().listSecrets({
    environment: INFISICAL_ENV[process.env.NODE_ENV!], // stg, dev, prod, or custom environment slugs
    // environment: process.env.NODE_ENV!, // stg, dev, prod, or custom environment slugs
    projectId: process.env.INFISICAL_PROJECT_ID!,
  });
  const _secrets = secrets.reduce(
    (acc, secret) => ({
      ...acc,
      [secret.secretKey]: secret.secretValue,
    }),
    {}
  );
  globalThis.SECRETS = _secrets;
};
