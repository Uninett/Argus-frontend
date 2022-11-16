# This image installs all dependencies and "pre-builds" an Argus frontend
# site, intended as a stepstone builder image for a full production site.
# It should run with the git repo root as the build context
FROM node:16-bullseye
WORKDIR /app

COPY . /app

RUN npm ci
RUN npx browserslist@latest --update-db
RUN npm run build

ONBUILD RUN npm run build

# When used as an intermediate builder image, the complete set of statically
# built files to serve from the web server root can be copied from /app/build
