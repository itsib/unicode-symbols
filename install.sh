#!/bin/bash

OUTPUT_DIR="./out/make/deb/x64"
PACKAGE=

if ! [ -d "$OUTPUT_DIR" ]; then
  echo -e "⨯ Package not found."
  exit 1
fi

for filename in "$OUTPUT_DIR/"*.deb; do
    PACKAGE="$filename"
    break
done

echo -e "\x1b[0;37mInstalling package:\x1b[0m \x1b[0;32m$PACKAGE\x1b[0m\x1b[0;37m"

sudo dpkg -i "$PACKAGE"

echo -ne "\x1b[0m"