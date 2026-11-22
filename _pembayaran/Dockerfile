FROM node:24-alpine
WORKDIR /app
COPY . .
RUN rm -f .env && mkdir -p /app/data && chown -R node:node /app/data
USER node
ENV NODE_ENV=production PORT=8088 DATA_DIR=/app/data NODE_NO_WARNINGS=1
EXPOSE 8088
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://127.0.0.1:8088/api/pay/health || exit 1
CMD ["node", "server.js"]
