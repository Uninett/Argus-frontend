#!/bin/sh -x
env
npm install
exec npm run-script dockerstart
