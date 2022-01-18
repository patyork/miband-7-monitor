[Live demo](https://miband-6-heart-rate-monitor.pages.dev/)

# Mi Band 6 Heart Rate Monitor

Display your Mi Band 6's heart rate in the browser. 

![Heart rate webapp](img/screenshot.png)

Changelog:
- **Fixed authentication so it works with modern firmwares (Thanks Gadgetbridge for the inspiration, tiny-ecdh-c for elliptic curve Diffie-Hellman implementation)** 

## Requirements

1. A device with Bluetooth support
2. A browser that supports the Web Bluetooth API (check [here](https://caniuse.com/web-bluetooth))
3. An auth key for your Mi Band (check out https://codeberg.org/Freeyourgadget/Gadgetbridge/wiki/Huami-Server-Pairing)

## How to use

1. Go to https://miband-6-heart-rate-monitor.pages.dev/
2. Insert your Mi Band's auth key
3. Wear your Mi Band
3. Click connect
4. Wait about 30 seconds for it to receive measurements

For troubleshooting, check the browser's developer console

## Inspiration

- [Jaapp-/miband-5-heart-rate-monitor](https://github.com/Jaapp-/miband-5-heart-rate-monitor)
- [satcar77/miband4](https://github.com/satcar77/miband4)
- [vshymanskyy/miband-js](https://github.com/vshymanskyy/miband-js)
- [VladKolerts/miband4](https://github.com/VladKolerts/miband4)

## Libraries

- [tiny-ECDH-wasm (used for modern auth)](https://github.com/gzalo/tiny-ECDH-wasm)
