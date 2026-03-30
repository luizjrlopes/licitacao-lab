FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
COPY prisma ./prisma

RUN npm run prisma:generate

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
