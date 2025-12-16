FROM node:24-bookworm

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

COPY frontend/package.json frontend/pnpm-lock.yaml ./frontend/
COPY shared/package.json ./shared/
COPY wrangler/package.json wrangler/pnpm-lock.yaml ./wrangler/

RUN pnpm install --frozen-lockfile

COPY frontend ./frontend
COPY shared ./shared

CMD ["pnpm", "--filter", "frontend", "dev", "--host"]
