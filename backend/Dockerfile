FROM debian:bookworm-slim
WORKDIR /app
COPY pocketbase .
COPY pb_migrations ./pb_migrations
COPY pb_hooks ./pb_hooks
RUN chmod +x /app/pocketbase
EXPOSE 8090
CMD ["/app/pocketbase", "serve", "--http=0.0.0.0:8090"]
