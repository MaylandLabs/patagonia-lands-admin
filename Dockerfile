FROM node:20-alpine

WORKDIR /app

COPY package.json ./

RUN npm install serve -g
RUN npm install

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["serve", "-s", "dist", "-p", "5000"]
