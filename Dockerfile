
FROM node:24.8.0 as build
WORKDIR /app

COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .

RUN npm install -g pnpm@latest
RUN pnpm install
COPY . .

RUN pnpm prisma generate
RUN pnpm build

FROM node:24.8.0-alpine as production
WORKDIR /app

RUN npm install -g pnpm@latest

COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
COPY --from=build /app/prisma ./prisma/

RUN pnpm install --prod

RUN npx prisma generate

COPY --from=build /app/dist ./dist/

CMD ["pnpm", "start:prod"]
