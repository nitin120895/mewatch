FROM mhart/alpine-node:base-6

MAINTAINER Massive

ENV YARN_VERSION 0.20.3
ADD https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v${YARN_VERSION}.tar.gz /opt/yarn.tar.gz
RUN yarnDirectory=/opt/yarn && \
    mkdir -p "$yarnDirectory" && \
    tar -xzf /opt/yarn.tar.gz -C "$yarnDirectory" && \
    ln -s "$yarnDirectory/dist/bin/yarn" /usr/local/bin/ && \
    rm /opt/yarn.tar.gz

ENV PATH /root/.yarn/bin:$PATH
ENV NODE_ENV=production
ENV PORT=3030
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --production
COPY . ./

EXPOSE 3030

CMD ["node", "--optimize_for_size", "--max_old_space_size=460", "--gc_interval=100", "--abort-on-uncaught-exception", "server.js"]
