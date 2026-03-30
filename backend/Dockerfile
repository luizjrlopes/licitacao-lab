FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update -y \
	&& apt-get install -y openssl \
	&& rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
COPY prisma ./prisma

RUN npm run prisma:generate

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
