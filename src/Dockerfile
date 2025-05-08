FROM ubuntu:22.04 AS composer_base
RUN mkdir -p /opt/apps/trfuniverse
WORKDIR /opt/apps/trfuniverse
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
    && echo $TZ > /etc/timezone \
    && apt update \
    && apt install -y wget gnupg gosu curl ca-certificates zip unzip git libcap2-bin libpng-dev python2 software-properties-common dirmngr \
    && mkdir -p ~/.gnupg \
    && chmod 600 ~/.gnupg \
    && echo "disable-ipv6" >> ~/.gnupg/dirmngr.conf \
    && echo "keyserver hkp://keyserver.ubuntu.com:80" >> ~/.gnupg/dirmngr.conf \
    && gpg --recv-key 0x14aa40ec0831756756d7f66c4f4ea0aae5267a6c \
    && gpg --export 0x14aa40ec0831756756d7f66c4f4ea0aae5267a6c > /usr/share/keyrings/ppa_ondrej_php.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/ppa_ondrej_php.gpg] https://ppa.launchpadcontent.net/ondrej/php/ubuntu jammy main" > /etc/apt/sources.list.d/ppa_ondrej_php.list \
    && apt update \
    && apt dist-upgrade -y \
    && apt install -y php8.1-cli php8.1-gd \
       php8.1-curl php8.1-imap php8.1-mysql php8.1-mbstring \
       php8.1-xml php8.1-zip php8.1-bcmath php8.1-soap \
       php8.1-intl php8.1-readline \
       php8.1-msgpack php8.1-igbinary php8.1-redis php8.1-swoole \
       php8.1-memcached php8.1-pcov php8.1-xdebug php8.1-mongodb \
    && php -r "readfile('https://getcomposer.org/installer');" | php -- --install-dir=/usr/bin/ --filename=composer \
    && apt -yqq autoclean \
    && apt -yqq autoremove --purge \
    && apt -yqq purge $(dpkg --get-selections | grep deinstall | sed s/deinstall//g) \
    && apt clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/cache/* /var/tmp/* \
    && groupadd composer \
    && useradd -s /bin/bash -g composer composer \
    && chown -R composer /opt/apps/trfuniverse
USER composer
COPY --chown=composer ./api .
RUN cp .env.deployment .env \ 
    && composer install --no-dev --prefer-dist

FROM ubuntu:22.04 AS cli
LABEL org.opencontainers.image.source=https://github.com/alaimos/tRFUniverse
WORKDIR /opt/apps/trfuniverse
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC
COPY ./docker/entrypoint.sh /usr/local/bin/entrypoint.sh
COPY ./docker/install.R /opt/install.R
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
    && echo $TZ > /etc/timezone \
    && apt update \
    && apt install -y wget gnupg gosu curl ca-certificates zip unzip git libcap2-bin libpng-dev python2 software-properties-common dirmngr \
    && mkdir -p ~/.gnupg \
    && chmod 600 ~/.gnupg \
    && echo "disable-ipv6" >> ~/.gnupg/dirmngr.conf \
    && echo "keyserver hkp://keyserver.ubuntu.com:80" >> ~/.gnupg/dirmngr.conf \
    && gpg --recv-key 0x14aa40ec0831756756d7f66c4f4ea0aae5267a6c \
    && gpg --export 0x14aa40ec0831756756d7f66c4f4ea0aae5267a6c > /usr/share/keyrings/ppa_ondrej_php.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/ppa_ondrej_php.gpg] https://ppa.launchpadcontent.net/ondrej/php/ubuntu jammy main" > /etc/apt/sources.list.d/ppa_ondrej_php.list \
    && wget -qO- https://cloud.r-project.org/bin/linux/ubuntu/marutter_pubkey.asc | tee -a /etc/apt/trusted.gpg.d/cran_ubuntu_key.asc \
    && wget -q -O- https://eddelbuettel.github.io/r2u/assets/dirk_eddelbuettel_key.asc | tee -a /etc/apt/trusted.gpg.d/cranapt_key.asc \
    && add-apt-repository "deb https://cloud.r-project.org/bin/linux/ubuntu $(lsb_release -cs)-cran40/" \
    && echo "deb [arch=amd64] https://r2u.stat.illinois.edu/ubuntu jammy main" > /etc/apt/sources.list.d/cranapt.list \
    && apt update -qq \
    && echo "Package: *" > /etc/apt/preferences.d/99cranapt \
    && echo "Pin: release o=CRAN-Apt Project" >> /etc/apt/preferences.d/99cranapt \
    && echo "Pin: release l=CRAN-Apt Packages" >> /etc/apt/preferences.d/99cranapt \
    && echo "Pin-Priority: 700"  >> /etc/apt/preferences.d/99cranapt \
    && apt dist-upgrade -y \
    && apt install -y php8.1-cli php8.1-gd php8.1-curl \
       php8.1-imap php8.1-mysql php8.1-mbstring \
       php8.1-xml php8.1-zip php8.1-bcmath php8.1-soap \
       php8.1-intl php8.1-readline php8.1-msgpack php8.1-igbinary \
       php8.1-redis php8.1-swoole php8.1-memcached php8.1-pcov \
       php8.1-xdebug php8.1-mongodb nodejs pandoc r-base r-base-dev \
       libcurl4-openssl-dev cmake libxml2-dev libfontconfig1-dev \
       libharfbuzz-dev libfribidi-dev libfreetype6-dev libpng-dev libtiff5-dev libjpeg-dev \
       libgit2-dev python3-dbus python3-gi python3-apt \
    && Rscript -e 'install.packages("bspm")' \
    && RHOME=$(R RHOME) \
    && echo "suppressMessages(bspm::enable())" >> ${RHOME}/etc/Rprofile.site \
    && echo "options(bspm.version.check=FALSE)" >> ${RHOME}/etc/Rprofile.site \
    && php -r "readfile('https://getcomposer.org/installer');" | php -- --install-dir=/usr/bin/ --filename=composer \
    && Rscript "/opt/install.R" \
    && apt remove -y r-base-dev libcurl4-openssl-dev cmake libxml2-dev libfontconfig1-dev \
       libharfbuzz-dev libfribidi-dev libfreetype6-dev libpng-dev libtiff5-dev libjpeg-dev \
       libgit2-dev \
    && apt -yqq autoclean \
    && apt -yqq autoremove --purge \
    && apt -yqq purge $(dpkg --get-selections | grep deinstall | sed s/deinstall//g) \
    && apt clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/cache/* /var/tmp/* \
    && groupadd user \
    && useradd -s /bin/bash -g user user \
    && chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
USER www-data
COPY --chown=www-data --from=composer_base /opt/apps/trfuniverse /opt/apps/trfuniverse
COPY ./docker/php.ini /etc/php/8.1/cli/conf.d/99-trfuniverse.ini
CMD ["php", "-a"]

FROM cli AS fpm_server
LABEL org.opencontainers.image.source=https://github.com/alaimos/tRFUniverse
WORKDIR /opt/apps/trfuniverse
USER root
COPY ./docker/start-fpm.sh /usr/local/bin/start-fpm.sh
COPY ./docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN apt update \
    && apt install -y php8.1-fpm \
    && apt -yqq autoclean \
    && apt -yqq autoremove --purge \
    && apt -yqq purge $(dpkg --get-selections | grep deinstall | sed s/deinstall//g) \
    && apt clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/cache/* /var/tmp/* \
    && chown -R www-data:www-data /opt/apps/trfuniverse \
    && sed -i 's#pid = /run/php/php8.1-fpm.pid#pid = /tmp/php8.1-fpm.pid#' /etc/php/8.1/fpm/php-fpm.conf \
    && sed -i 's#error_log = /var/log/php8.1-fpm.log#error_log = /dev/stdout#' /etc/php/8.1/fpm/php-fpm.conf \
    && sed -i 's#;daemonize = yes#daemonize = no#' /etc/php/8.1/fpm/php-fpm.conf \
    && sed -i 's#listen = /run/php/php8.1-fpm.sock#listen = 9000#' /etc/php/8.1/fpm/pool.d/www.conf \
    && cp /etc/php/8.1/cli/conf.d/99-trfuniverse.ini /etc/php/8.1/fpm/conf.d/99-trfuniverse.ini \
    && chmod +x /usr/local/bin/start-fpm.sh \
    && chmod +x /usr/local/bin/entrypoint.sh \
    && { \
    echo '[global]'; \
    echo 'error_log = /proc/self/fd/2'; \
    echo 'log_limit = 8192'; \
    echo ; \
    echo '[www]'; \
    echo 'access.log = /proc/self/fd/2'; \
    echo 'clear_env = no'; \
    echo ; \
    echo '; Ensure worker stdout and stderr are sent to the main error log.'; \
    echo 'catch_workers_output = yes'; \
    echo 'decorate_workers_output = no'; \
    } | tee /etc/php/8.1/fpm/pool.d/docker.conf
USER www-data
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
USER root
STOPSIGNAL SIGQUIT
EXPOSE 9000
CMD ["/usr/local/bin/start-fpm.sh"]

FROM cli AS web_server
LABEL org.opencontainers.image.source=https://github.com/alaimos/tRFUniverse
WORKDIR /opt/apps/trfuniverse
USER root
COPY ./docker/start-nginx.sh /usr/local/bin/start-nginx.sh
COPY ./docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN apt update \
    && apt install -y gettext-base nginx \
    && apt -yqq autoclean \
    && apt -yqq autoremove --purge \
    && apt -yqq purge $(dpkg --get-selections | grep deinstall | sed s/deinstall//g) \
    && apt clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/cache/* /var/tmp/* \
    && chown -R www-data:www-data /opt/apps/trfuniverse \
    && chmod +x /usr/local/bin/start-nginx.sh \
    && chmod +x /usr/local/bin/entrypoint.sh \
    && ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log
COPY ./docker/nginx.default.conf.template /etc/nginx/sites-available/default.template
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
EXPOSE 80/tcp
STOPSIGNAL SIGQUIT
CMD ["/usr/local/bin/start-nginx.sh"]

FROM cli AS cron
LABEL org.opencontainers.image.source=https://github.com/alaimos/tRFUniverse
WORKDIR /opt/apps/trfuniverse
ENV NO_INIT=true
USER root
RUN apt update \
    && apt install -y cron \
    && apt -yqq autoclean \
    && apt -yqq autoremove --purge \
    && apt -yqq purge $(dpkg --get-selections | grep deinstall | sed s/deinstall//g) \
    && apt clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/cache/* /var/tmp/* \
    && touch laravel.cron \
    && echo "* * * * * cd /opt/apps/trfuniverse && php artisan schedule:run" >> laravel.cron \
    && crontab -u www-data laravel.cron
STOPSIGNAL SIGQUIT
CMD ["cron", "-L", "2", "-f"]
