# Docker production image of Argus frontend

Whereas the top-level Dockerfile is development-oriented, this directory
contains definitions to build a production-oriented Docker image of the Argus
front-end / user interface application.

However, as the front-end is a React-based application built from TypeScript
sources, the necessary configuration to talk to an Argus API back-end server is
staticailly compiled into the resulting web site.

This image can therefore only be used to serve as a intermediate build image,
to produce the actual statically compiled application with your site's settings
embedded.

To build this image, the build context needs to be that of the git repository
root. Something like this would work (when the current working directory is
here):

```shell
docker build -t argus-frontend -f Dockerfile ..
```

Or, from the top level directory:

```shell
docker build -t argus-frontend -f docker/Dockerfile .
```

## Using this intermediate image for building a production site

To build a complete Argus front-end application for your site, you need to
write a two-stage `Dockerfile`.

The first stage will be based on this image, while taking the necessary build
configuration as Docker build arguments, then building the React application
using `npm`. The resulting files should be served in the document root of any
web server. The can be copied from the path `/app/build` in the first stage
build container.

The image defined here will normally be published as
`ghcr.io/uninett/argus-frontend:<version>`. If you want to build a production
site from Argus frontend version *1.6.1*, you would write something like this:

```Dockerfile
FROM ghcr.io/uninett/argus-frontend:1.6.1 AS build

# These arguments are needed in the environment to properly configure and build
# Argus-frontend for this site:
ARG REACT_APP_BACKEND_URL=http://argus.example.org
ARG REACT_APP_ENABLE_WEBSOCKETS_SUPPORT=true
ARG REACT_APP_BACKEND_WS_URL=wss://argus.example.org/ws
ARG REACT_APP_USE_SECURE_COOKIE=true
ARG REACT_APP_DEBUG=true
ARG REACT_APP_DEFAULT_AUTO_REFRESH_INTERVAL=30
ARG REACT_APP_REALTIME_SERVICE_MAX_RETRIES=5
ARG REACT_APP_COOKIE_DOMAIN=argus.example.org

RUN npm run build

##########################################################
# Stage 2:
# production environment consisting only of nginx and the statically compiled
# Argus Frontend application files
# FROM: https://mherman.org/blog/dockerizing-a-react-app/
FROM nginx:stable-alpine

COPY --from=build /app/build /usr/share/nginx/html

RUN apk add --update tini tree
COPY nginx.conf /etc/nginx/conf.d/default.conf

ENTRYPOINT ["/sbin/tini", "-v", "--"]
CMD ["nginx", "-g", "daemon off;"]
```

The first stage builds a set of static files based on your build arguments. The
second stage copies the produced file tree and serves it using an nginx web
server.

## Limitations

This is not a complete Argus environment.  This image only provides the
single-page user interface application to operate against an [Argus API
server](https://github.com/Uninett/Argus). The API server also has dependencies
to other services.

For a full production environment example, take a look at
https://github.com/Uninett/argus-docker
