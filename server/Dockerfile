FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

COPY --chown=node:node . .

ENV NODE_ENV=production
EXPOSE 5000

USER node

CMD ["node", "server.js"]
