# Build context = repo root (Koyeb). Path relatif dari root.
FROM golang:1.24-alpine AS builder
WORKDIR /app

COPY E-BPHTB_MIgration/backend/go.mod E-BPHTB_MIgration/backend/go.sum ./
RUN go mod download

COPY E-BPHTB_MIgration/backend ./
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /server ./cmd/server

FROM alpine:3.19
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /app
COPY --from=builder /server .

ENV PORT=8000
EXPOSE 8000
CMD ["./server"]
