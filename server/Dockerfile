FROM node:20-bookworm-slim

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY db ./db
COPY repositories ./repositories
COPY routes ./routes
COPY services ./services
COPY app.js bootstrap.js index.js ./

ENV PORT=5050
ENV SQLITE_PATH=/app/data/appointments.db
EXPOSE 5050

RUN mkdir -p /app/data

CMD ["node", "index.js"]
