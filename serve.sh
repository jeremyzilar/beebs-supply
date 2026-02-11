#!/bin/sh

echo "Building Tailwind CSS..."
yarn build

echo "Serving on http://localhost:3000"
yarn dev
