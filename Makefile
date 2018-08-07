.PHONY: all clean

# Support clean Qt5 qmake or Qt switcher
QMAKE := $(shell command -v qmake-qt5 2> /dev/null || echo qmake -qt=5)

all: pintotray-firefox.zip pintotray-native-source.tar.gz pintotray-native-x86-64.tar.gz

clean:
	rm -rvf build *.tar.gz *.zip

pintotray-firefox.zip:
	zip -r $@ webextension

pintotray-native-source.tar.gz:
	tar -C native -cavf $@ pintotray

pintotray-native-x86-64.tar.gz:
	mkdir -p build/pintotray-x86-64 && cd build && $(QMAKE) QMAKE_CXX=$(CXX) ../native/pintotray && make
	cp build/pintotray build/pintotray-x86-64
	tar -C build -cavf $@ pintotray-x86-64
