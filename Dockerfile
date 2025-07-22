FROM ubuntu:latest

WORKDIR /app

USER root

ENV NO_COLOR=1

RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
    curl \
    unzip \
    tar \
    gzip \
    bzip2 \
    xz-utils \
    ripgrep \
    && \
    rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deno.land/install.sh | sh -y

COPY . .

EXPOSE 7860

CMD ["deno", "run", "-A", "main.ts"]
