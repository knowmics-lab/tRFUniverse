#!/bin/bash
set -e

check_and_create() {
    if [ ! -d "$1" ]; then
        mkdir -p "$1"
        chown -R www-data:www-data "$1"
    fi
}

check_and_remove() {
    if [ -L "$1" ]; then
        rm "$1"
    fi
}

artisan() {
    /usr/bin/php /opt/apps/trfuniverse/artisan "$@"
}

if [ "$NO_INIT" != "true" ] && [ -f "/usr/bin/php" ] && [ -f "/opt/apps/trfuniverse/artisan" ]; then
    PW="$(pwd)"
    check_and_create "/opt/apps/trfuniverse/storage/logs"
    check_and_create "/opt/apps/trfuniverse/storage/framework/cache"
    check_and_create "/opt/apps/trfuniverse/storage/framework/cache/data"
    check_and_create "/opt/apps/trfuniverse/storage/framework/sessions"
    check_and_create "/opt/apps/trfuniverse/storage/framework/views"
    check_and_create "/opt/apps/trfuniverse/storage/framework/testing"
    check_and_create "/opt/apps/trfuniverse/storage/app/cache"
    check_and_create "/opt/apps/trfuniverse/storage/app/public"
    check_and_remove "/opt/apps/trfuniverse/public/storage"
    artisan event:cache
    artisan route:cache
    artisan view:cache
    artisan config:cache
    # artisan storage:link
    cd "$PW"
fi

exec "$@"
