FROM php:8.3-fpm-alpine AS base

RUN apk add --no-cache \
    nginx supervisor curl zip unzip git \
    oniguruma-dev libxml2-dev postgresql-dev \
    && docker-php-ext-install pdo pdo_pgsql mbstring xml bcmath opcache

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

RUN mkdir -p bootstrap/cache storage/framework/{sessions,views,cache} storage/logs \
    && chmod -R 775 bootstrap/cache storage

RUN composer install --optimize-autoloader --no-interaction --no-dev

RUN php artisan config:cache \
    && php artisan route:cache \
    && php artisan storage:link

RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache \
    && chmod -R 775 /app/storage /app/bootstrap/cache

COPY docker/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf /etc/supervisord.conf
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

CMD ["/entrypoint.sh"]
