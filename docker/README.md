# Docker production image of Argus frontend

Whereas the top-level Dockerfile is development-oriented, this directory
contains definitions to build a production-oriented Docker image of the Argus
front-end / user interface application.

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

The image defined here will normally be built and published automatically as
`ghcr.io/uninett/argus-frontend:<version>` every time a new Argus-frontend
version is release, meaning you don't necessarily have to build it from source
unless you want to make changes to how the image works.

## Running the Docker image in a container on a production site

The image will serve the Argus front-end application using a simple NGINX
server, listening internall on port *8080*.  A `runtime-config.json`
configuration file will be created each time the container starts, constructed
from the same *environment* variables as described in
[../README.md](../README.md).

To serve a frontend that connects to an Argus API server at
https://argus.example.org you can run something like:

```sh
docker run \
    -p 80:8080 \
    -e REACT_APP_BACKEND_URL='https://argus.example.org' \
    -e REACT_APP_BACKEND_WS_URL='wss://argus.example.org/ws' \
    --name argus-web \
    ghcr.io/uninett/argus-frontend:1.13.0
```

The argus front-end application should now be available to you at
http://localhost/


## Limitations

This is not a complete Argus environment.  This image only provides the
single-page user interface application to operate against an [Argus API
server](https://github.com/Uninett/Argus). The API server also has dependencies
to other services.

For a full production environment example, take a look at
https://github.com/Uninett/argus-docker
