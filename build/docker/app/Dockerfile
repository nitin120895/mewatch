FROM node:12.22.4-alpine

MAINTAINER Massive

RUN apk add --no-cache --update tini
RUN apk add python make g++

ENV NODE_ENV=production \
    TZ=utc \
    FORCE_HTTPS=true \
    PORT=9001

# If your production lib(s) require native compilation uncomment the following line.
#RUN apk add --no-cache make gcc g++ python
RUN mkdir -p /app/build/script && touch /app/build/script/post-install.js

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --production
COPY . ./

EXPOSE 9001

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "--optimize_for_size", "--max_old_space_size=460", "--gc_interval=100", "--perf_basic_prof_only_functions", "--abort-on-uncaught-exception", "server/index.js"]
