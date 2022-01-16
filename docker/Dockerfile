FROM ubuntu:20.04 AS build

RUN apt update && \
    apt install -y chezscheme git build-essential libgmp-dev rlwrap
    
RUN git clone https://github.com/idris-lang/Idris2.git && \
    cd Idris2 && \
    make bootstrap SCHEME=scheme && \
    make install

FROM ubuntu:20.04

RUN apt update && apt install -y make chezscheme && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /root/.idris2

COPY --from=build /root/.idris2 /root/.idris2 

ENV PATH="/root/.idris2/bin:${PATH}"

CMD echo "Hello World" && echo "1+1" | idris2
 