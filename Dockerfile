FROM denoland/deno

EXPOSE 7860

WORKDIR /app

USER root

ENV NO_COLOR=1

RUN apt-get update && apt-get install -y unzip tar gzip bzip2 xz-utils ripgrep

COPY . .

RUN deno install --entrypoint main.ts

RUN deno cache main.ts

CMD ["deno", "-A", "main.ts"]
