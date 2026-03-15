# Build stage — jalan saat context = repo root (Koyeb) atau = backend folder (lokal)
# Di Koyeb: Dockerfile path = E-BPHTB_MIgration/backend/Dockerfile, context = repo root
FROM golang:1.23-alpine AS builder
WORKDIR /app

# Jika context repo root: copy dari E-BPHTB_MIgration/backend
COPY E-BPHTB_MIgration/backend/go.mod E-BPHTB_MIgration/backend/go.sum ./
RUN go mod download

COPY E-BPHTB_MIgration/backend ./
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /server ./cmd/server

# Run stage
FROM alpine:3.19
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /app

COPY --from=builder /server .

ENV PORT=3005
EXPOSE 3005

CMD ["./server"]
