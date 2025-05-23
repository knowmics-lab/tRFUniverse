FROM ubuntu:22.04

LABEL maintainer="Taylor Otwell"

ARG WWWGROUP
ARG NODE_VERSION=18
ARG POSTGRES_VERSION=14

WORKDIR /var/www/html

ENV DEBIAN_FRONTEND noninteractive
ENV TZ=UTC

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt-get update \
    && apt-get install -y wget gnupg gosu curl ca-certificates zip unzip git supervisor sqlite3 libcap2-bin \
       libpng-dev python2 software-properties-common dirmngr \
    && mkdir -p ~/.gnupg \
    && chmod 600 ~/.gnupg \
    && echo "disable-ipv6" >> ~/.gnupg/dirmngr.conf \
    && echo "keyserver hkp://keyserver.ubuntu.com:80" >> ~/.gnupg/dirmngr.conf \
    && gpg --recv-key 0x14aa40ec0831756756d7f66c4f4ea0aae5267a6c \
    && gpg --export 0x14aa40ec0831756756d7f66c4f4ea0aae5267a6c > /usr/share/keyrings/ppa_ondrej_php.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/ppa_ondrej_php.gpg] https://ppa.launchpadcontent.net/ondrej/php/ubuntu jammy main" > /etc/apt/sources.list.d/ppa_ondrej_php.list \
    && wget -qO- https://cloud.r-project.org/bin/linux/ubuntu/marutter_pubkey.asc | tee -a /etc/apt/trusted.gpg.d/cran_ubuntu_key.asc \
    && wget -q -O- https://eddelbuettel.github.io/r2u/assets/dirk_eddelbuettel_key.asc | tee -a /etc/apt/trusted.gpg.d/cranapt_key.asc \
    && curl -sLS https://deb.nodesource.com/setup_$NODE_VERSION.x | bash - \
    && add-apt-repository "deb https://cloud.r-project.org/bin/linux/ubuntu $(lsb_release -cs)-cran40/" \
    && echo "deb [arch=amd64] https://r2u.stat.illinois.edu/ubuntu jammy main" > /etc/apt/sources.list.d/cranapt.list \
    && apt update -qq \
    && echo "Package: *" > /etc/apt/preferences.d/99cranapt \
    && echo "Pin: release o=CRAN-Apt Project" >> /etc/apt/preferences.d/99cranapt \
    && echo "Pin: release l=CRAN-Apt Packages" >> /etc/apt/preferences.d/99cranapt \
    && echo "Pin-Priority: 700"  >> /etc/apt/preferences.d/99cranapt \
    && apt dist-upgrade -y \
    && apt install -y php8.1-cli php8.1-dev \
       php8.1-pgsql php8.1-sqlite3 php8.1-gd \
       php8.1-curl \
       php8.1-imap php8.1-mysql php8.1-mbstring \
       php8.1-xml php8.1-zip php8.1-bcmath php8.1-soap \
       php8.1-intl php8.1-readline \
       php8.1-ldap \
       php8.1-msgpack php8.1-igbinary php8.1-redis php8.1-swoole \
       php8.1-memcached php8.1-pcov php8.1-xdebug php8.1-mongodb \
       nodejs pandoc \
       r-base r-base-dev libcurl4-openssl-dev cmake libxml2-dev libfontconfig1-dev \
       libharfbuzz-dev libfribidi-dev libfreetype6-dev libpng-dev libtiff5-dev libjpeg-dev \
       libgit2-dev python3-dbus python3-gi python3-apt \
    && Rscript -e 'install.packages("bspm")' \
    && RHOME=$(R RHOME) \
    && echo "suppressMessages(bspm::enable())" >> ${RHOME}/etc/Rprofile.site \
    && echo "options(bspm.version.check=FALSE)" >> ${RHOME}/etc/Rprofile.site \
    && php -r "readfile('https://getcomposer.org/installer');" | php -- --install-dir=/usr/bin/ --filename=composer \
    && npm install -g npm \
    && curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | gpg --dearmor | tee /usr/share/keyrings/yarn.gpg >/dev/null \
    && echo "deb [signed-by=/usr/share/keyrings/yarn.gpg] https://dl.yarnpkg.com/debian/ stable main" > /etc/apt/sources.list.d/yarn.list \
    && curl -sS https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor | tee /usr/share/keyrings/pgdg.gpg >/dev/null \
    && echo "deb [signed-by=/usr/share/keyrings/pgdg.gpg] http://apt.postgresql.org/pub/repos/apt jammy-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
    && apt-get update \
    && apt-get install -y yarn \
    && apt-get install -y mysql-client \
    && apt-get install -y postgresql-client-$POSTGRES_VERSION \
    && Rscript -e 'install.packages("BiocManager")' \
    && Rscript -e 'BiocManager::install(version = "3.19", ask=FALSE)' \
    && Rscript -e 'BiocManager::install(c("Glimma", "MASS", "argparse", "edgeR", "ggfortify", "ggplot2", "ggpubr", "htmlwidgets", "jsonlite", "limma", "plotly", "sfsmisc", "survival", "survminer", "qvalue"), ask=FALSE)' \
    && Rscript -e 'BiocManager::install(c("ica", "Rtsne", "uwot", "devtools", "gtools", "readr", "base64enc"), ask=FALSE)' \
    && Rscript -e 'BiocManager::install(c("clusterProfiler", "DOSE", "ReactomePA", "org.Hs.eg.db", "multiMiR"), ask=FALSE)' \
    && Rscript -e 'devtools::install_github("alaimos/morpheus.R")' \
    && apt-get -y autoremove \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN setcap "cap_net_bind_service=+ep" /usr/bin/php8.1

RUN groupadd --force -g $WWWGROUP sail
RUN useradd -ms /bin/bash --no-user-group -g $WWWGROUP -u 1337 sail

COPY start-container /usr/local/bin/start-container
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY php.ini /etc/php/8.1/cli/conf.d/99-sail.ini
RUN chmod +x /usr/local/bin/start-container

EXPOSE 8000

ENTRYPOINT ["start-container"]
