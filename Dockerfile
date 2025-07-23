FROM ghcr.io/puppeteer/puppeteer:24.13.0

ENV PUPPETEER_SKIP_CHROMUIM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY . .
RUN npx tsc
CMD [ "node", "build/index.js" ]