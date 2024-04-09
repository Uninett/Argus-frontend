#!/bin/sh
# Build the runtime config from environment:
envsubst < /runtime-config-template.json > /usr/share/nginx/html/runtime-config.json
# Now serve the static files forever:
exec nginx -g "daemon off;"
