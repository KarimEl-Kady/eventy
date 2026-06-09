.PHONY: up down restart logs migrate seed shell-api shell-db

## Start all services in detached mode
up:
	docker compose up -d --build

## Stop and remove containers
down:
	docker compose down

## Restart everything
restart: down up

## Tail logs (all services). Usage: make logs  OR  make logs s=api
logs:
	docker compose logs -f $(s)

## Run Prisma migrations inside the running API container
migrate:
	docker compose exec api npx prisma migrate deploy

## Run the Prisma seed script
seed:
	docker compose exec api npx prisma db seed

## Open a shell inside the API container
shell-api:
	docker compose exec api sh

## Open a psql session inside the Postgres container
shell-db:
	docker compose exec postgres psql -U karim -d mydb
