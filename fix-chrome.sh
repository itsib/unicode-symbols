#!/bin/bash

INSTALL_PATH="/home/sergey/projects/unicode-symbols/node_modules/electron/dist"

if ! [ -d "$INSTALL_PATH" ]; then
  echo -e "Install path not exists $INSTALL_PATH"
fi

cd "$INSTALL_PATH" || exit 1

sudo chown root:root chrome-sandbox
sudo chmod 4755 chrome-sandbox