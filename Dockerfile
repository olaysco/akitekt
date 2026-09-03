# syntax=docker/dockerfile:1.6

  FROM --platform=$BUILDPLATFORM node:22-bookworm AS frontend-builder
  WORKDIR /workspace/web
  COPY apps/web/package*.json ./
  RUN npm ci --no-audit
  COPY apps/web/ ./
  RUN npm run build

  FROM --platform=$BUILDPLATFORM golang:1.25-bookworm AS go-builder
  ARG TARGETOS
  ARG TARGETARCH
  WORKDIR /workspace
  COPY apps/api ./
  RUN CGO_ENABLED=0 GOOS=${TARGETOS:-linux} GOARCH=${TARGETARCH:-amd64} \
      go build -o /workspace/bin/akitekt ./cmd/server

  FROM gcr.io/distroless/base-debian12:nonroot
  WORKDIR /app
  COPY --from=go-builder /workspace/bin/akitekt ./akitekt
  COPY --from=frontend-builder /workspace/web/dist ./web/dist
  ENV AKITEKT_STATIC_DIR=/app/web/dist
  EXPOSE 8080
  ENTRYPOINT ["/app/akitekt"]