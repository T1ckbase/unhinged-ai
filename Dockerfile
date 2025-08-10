FROM ubuntu:latest

WORKDIR /app

USER root

ENV NO_COLOR=1

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -yqq \
    curl \
    unzip \
    tar \
    gzip \
    bzip2 \
    xz-utils \
    ripgrep \
    git \
    wget \
    build-essential \
    iputils-ping \
    net-tools \
    procps \
    less \
    dnsutils \
    && \
    rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deno.land/install.sh | sh -s -- -y

ENV PATH="/root/.deno/bin:${PATH}"

COPY . .

EXPOSE 7860

RUN chmod -R 777 /app

RUN deno install --entrypoint main.ts

RUN deno cache main.ts

CMD ["deno", "run", "-A", "main.ts"]
