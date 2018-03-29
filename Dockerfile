# base image
FROM pelias/baseimage

# maintainer information
LABEL maintainer="pelias.team@gmail.com"

# downloade apt dependencies
# note: this is done in one command in order to keep down the size of intermediate containers
RUN apt-get update && apt-get install -y bzip2 && apt-get install -y unzip && rm -rf /var/lib/apt/lists/*

# Where the app is built and run inside the docker fs
RUN useradd -ms /bin/bash pelias
ENV WORK='/home/pelias'
WORKDIR ${WORK}

# copy package.json first to prevent npm install being rerun when only code changes
COPY ./package.json ${WORK}

# install npm dependencies
RUN npm install

# copy files to container
COPY . ${WORK}

# set location of pelias.json
ENV PELIAS_CONFIG "${WORK}/pelias.json"

# only allow containers to succeed if tests pass
RUN npm test
