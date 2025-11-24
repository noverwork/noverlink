#!/bin/sh

# Use MIGRATOR_COMMAND environment variable if set, otherwise use first argument, default to 'up'
COMMAND=${MIGRATOR_COMMAND:-${1:-up}}

case "$COMMAND" in
    "up")
        node dist/migrator/main.js up
        ;;
    "down")
        node dist/migrator/main.js down
        ;;
    "refresh")
        node dist/migrator/main.js refresh
        ;;
    "create")
        if [ -z "$2" ]; then
            echo "Error: Migration name required for 'create' command"
            exit 1
        fi
        node dist/migrator/main.js create "$2"
        ;;
    *)
        echo "Error: Invalid command. Use 'up', 'down', 'refresh', or 'create <name>'"
        exit 1
        ;;
esac 