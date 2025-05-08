VERSION ?= v2.0.0-alpha.3
REGISTRY ?= ghcr.io/alaimos/trfuniverse-
ARCH ?= linux/amd64

# Commands
all: clean api client
api: api-build api-push 
client: client-build client-push

clean:
	docker builder prune --all --force

api-build:
	DOCKER_BUILDKIT=1 docker build . --platform ${ARCH} --target cli -t ${REGISTRY}cli:${VERSION} -t ${REGISTRY}cli:latest
	DOCKER_BUILDKIT=1 docker build . --platform ${ARCH} --target cron -t ${REGISTRY}cron:${VERSION} -t ${REGISTRY}cron:latest
	DOCKER_BUILDKIT=1 docker build . --platform ${ARCH} --target fpm_server -t ${REGISTRY}fpm_server:${VERSION} -t ${REGISTRY}fpm_server:latest
	DOCKER_BUILDKIT=1 docker build . --platform ${ARCH} --target web_server -t ${REGISTRY}web_server:${VERSION} -t ${REGISTRY}web_server:latest

# DOCKER_BUILDKIT=1 docker push ${REGISTRY}cli:${VERSION}
# DOCKER_BUILDKIT=1 docker push ${REGISTRY}cron:${VERSION}
# DOCKER_BUILDKIT=1 docker push ${REGISTRY}fpm_server:${VERSION}
# DOCKER_BUILDKIT=1 docker push ${REGISTRY}web_server:${VERSION}
api-push:
	DOCKER_BUILDKIT=1 docker push ${REGISTRY}cli:latest
	DOCKER_BUILDKIT=1 docker push ${REGISTRY}cron:latest
	DOCKER_BUILDKIT=1 docker push ${REGISTRY}fpm_server:latest
	DOCKER_BUILDKIT=1 docker push ${REGISTRY}web_server:latest

client-build:
	cd client && DOCKER_BUILDKIT=1 docker build . --platform ${ARCH} --target runner -t ${REGISTRY}client:${VERSION} -t ${REGISTRY}client:latest && cd ..

# DOCKER_BUILDKIT=1 docker push ${REGISTRY}client:${VERSION}
client-push:
	DOCKER_BUILDKIT=1 docker push ${REGISTRY}client:latest
