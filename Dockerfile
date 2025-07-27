# build react client
FROM node:24.4.0-alpine AS build-react-stage

RUN mkdir -p /home/react
WORKDIR /home/react

COPY client/package.json client/package-lock.json ./
RUN npm ci

COPY client/ ./
RUN npm run build

# build express server
FROM node:24.4.0-alpine

WORKDIR /home/financial_tracker

# install curl for the health check and git for version
RUN apk add curl git

COPY server/package.json server/package-lock.json ./
RUN npm install --omit=dev

# copy the git folder to get the version
COPY server/ .git ./

RUN echo VERSION=$(git log --pretty=%H -1) > .env
ENV NODE_ENV=production
ENV PORT=8080
ENV TZ=America/Barbados

COPY --from=build-react-stage /home/react/dist static

EXPOSE 8080
HEALTHCHECK CMD curl --fail http://localhost:8080 || exit 1

CMD ["node", "financial_tracker_server"]
