#!/bin/sh
cd `dirname $0`
rm -R ./dist/
./src/node_modules/.bin/electron-packager ./src "S2E Sound Generator" --platform=darwin --arch=x64 --version=1.2.0 --out=dist --icon=icon/S2E-Sound-Generator-mac.icns --prune
./src/node_modules/.bin/electron-packager ./src "S2E Sound Generator" --platform=win32 --arch=x64 --version=1.2.0 --out=dist --icon=icon/S2E-Sound-Generator-win.ico --prune
