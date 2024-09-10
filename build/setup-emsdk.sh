mkdir -p /opt/dev \
&& cd /opt/dev \
&& git clone https://github.com/emscripten-core/emsdk.git \
&& cd /opt/dev/emsdk \
&& git reset --hard 20edf6614564cd76acac8107d746ca1182d6f3c5 \
&& ./emsdk install 3.1.64 \
&& ./emsdk activate 3.1.64
