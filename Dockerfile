# base image
FROM pelias/baseimage

# download apt dependencies
# note: this is done in one command in order to keep down the size of intermediate containers
RUN apt-get update && apt-get install -y bzip2 unzip && rm -rf /var/lib/apt/lists/*

# change working dir
ENV WORKDIR /code/pelias/transit
WORKDIR ${WORKDIR}

# add local code
ADD . ${WORKDIR}

# install npm dependencies
RUN npm install

# run tests
RUN npm test

# run as the pelias user
USER pelias
