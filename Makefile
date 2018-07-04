.PHONY: all clean

all: webextension.zip native-source.tar.gz native-x86-64.tar.gz

clean:
	rm -rvf build *.tar.gz *.zip

webextension.zip:
	zip -r $@ webextension

native-source.tar.gz:
	tar -C native -cavf $@ pintotray

native-x86-64.tar.gz:
	mkdir -p build/pintotray-x86-64 && cd build && qmake ../native/pintotray && make
	cp build/{pintotray,pintotray-x86-64}
	tar -C build -cavf $@ pintotray-x86-64
