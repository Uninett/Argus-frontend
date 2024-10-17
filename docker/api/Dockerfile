# Defines a simple Argus API server running from a configurable branch or tag
# in the upstream repo
FROM python:3.10
ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends tini build-essential

# Install argus from configured branch/tag and lock in some dev requirements
# that aren't part of the regular setup.cfg:
ARG BRANCH=master
ARG REPO=git+https://github.com/Uninett/argus
RUN pip install psycopg2-binary django-extensions python-dotenv ${REPO}@${BRANCH}

# Install api backend settings specific to dev deployment of frontend
RUN mkdir /extrapython
COPY dockerdev.py /extrapython/
ENV PYTHONPATH=/extrapython

ENV PORT=8000
EXPOSE 8000
COPY docker-entrypoint.sh /
ENTRYPOINT ["/usr/bin/tini", "-v", "--"]
CMD /docker-entrypoint.sh
