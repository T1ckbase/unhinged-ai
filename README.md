---
title: Unhinged Ai
emoji: 👁
colorFrom: pink
colorTo: indigo
sdk: docker
pinned: false
license: mit
short_description: unhinged ai
---

```shell
podman build -t unhinged-ai:latest .
podman run -p 7860:7860 -e GOOGLE_GENERATIVE_AI_API_KEY="api-key" unhinged-ai
```
