FROM node:20-alpine AS client-build

WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM node:20-alpine AS production

ENV NODE_ENV=production \
    PORT=4000

WORKDIR /app
COPY server/package*.json ./server/
RUN npm ci --prefix server --omit=dev
COPY server/ ./server/
COPY --from=client-build /app/client/dist ./client/dist

RUN mkdir -p server/data server/uploads \
    && chown -R node:node server/data server/uploads \
    && chmod -R a+rX client/dist

USER node
EXPOSE 4000
CMD ["node", "server/index.js"]
