#!/bin/sh
set -e

# Run migrations
php artisan migrate --force

exec supervisord -c /etc/supervisord.conf
