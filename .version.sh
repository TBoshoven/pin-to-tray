#!/bin/sh

sed -E -i "s/([0-9]+)\.custom/\\1.$1/" native/pintotray/version.h webextension/manifest.json
