#!/bin/sh
set -e

echo "=== Replacing environment variables ==="
echo "VITE_API_URL: ${VITE_API_URL}"
echo "VITE_APP_URL: ${VITE_APP_URL}"

find /usr/share/nginx/html -type f -name "*.js" | while read -r file; do
    sed -i "s|__VITE_API_URL__|${VITE_API_URL}|g" "$file"
    sed -i "s|__VITE_APP_URL__|${VITE_APP_URL}|g" "$file"
done

echo "=== Replacement complete ==="

exec "$@"
