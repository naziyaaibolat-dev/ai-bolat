# AI-bolat — өндірістік Docker бейнесі (Render / Fly.io / кез келген VPS)
FROM node:20-bookworm-slim
ENV NODE_ENV=production PORT=8790 HOST=0.0.0.0 DATA_DIR=/data
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY server ./server
COPY public ./public
COPY shared ./shared
COPY scripts/seed.js ./scripts/seed.js
RUN mkdir -p /data && chown -R node:node /data /app
USER node
EXPOSE 8790
VOLUME ["/data"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8790)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server/index.js"]
