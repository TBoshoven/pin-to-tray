.PHONY: all clean

# Support clean Qt5 qmake or Qt switcher
QMAKE := $(shell command -v qmake-qt5 2> /dev/null || echo qmake -qt=5)

all: webextension.zip native-source.tar.gz native-x86-64.tar.gz

clean:
	rm -rvf build *.tar.gz *.zip

webextension.zip:
	zip -r $@ webextension

native-source.tar.gz:
	tar -C native -cavf $@ pintotray

native-x86-64.tar.gz:
	mkdir -p build/pintotray-x86-64 && cd build && $(QMAKE) QMAKE_CXX=$(CXX) ../native/pintotray && make
	cp build/pintotray build/pintotray-x86-64
	tar -C build -cavf $@ pintotray-x86-64
