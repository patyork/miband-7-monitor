import { ADVERTISEMENT_SERVICE, CHAR_UUIDS, SERVICE_UUIDS, CHUNK_ENDPOINTS, CHUNK_COMMANDS, FETCH_COMMANDS, FETCH_DATA_TYPES } from "../constants.js";

export class Authenticator extends EventTarget {
    constructor(band) {
        super()
        var self = this;
        this.Band = band;

        this.ECC_PUB_KEY_SIZE = 48;
        this.ECC_PRV_KEY_SIZE = 24;

        this.reassembleBuffer = new Uint8Array(512);
        this.lastSequenceNumber = 0;
        this.reassembleBuffer_pointer = 0;
        this.reassembleBuffer_expectedBytes = 0;

        this.prv_buf = null;
        this.pub_buf = null;
        this.sec_buf = null;
        this.prv = null;
        this.pub = null;
        this.sec = null;
    }

    async connect() {
        await this.Band.Device.gatt.disconnect();
        const server = await this.Band.Device.gatt.connect();
        console.log("Connected through gatt");
        return server;
    }

    async authenticate() {
        var self = this
        self.listenerOnChunk = async (e) => this.onChunkedRead(e)

        // Hook
        await this.Band.GATT.startNotifications(this.Band.Chars.CHUNKED_READ, self.listenerOnChunk)

        this.pub_buf = Module._malloc(this.ECC_PUB_KEY_SIZE);
        this.prv_buf = Module._malloc(this.ECC_PRV_KEY_SIZE);
        this.pub = Module.HEAPU8.subarray(
            this.pub_buf,
            this.pub_buf + this.ECC_PUB_KEY_SIZE
        );
        this.prv = Module.HEAPU8.subarray(
            this.prv_buf,
            this.prv_buf + this.ECC_PRV_KEY_SIZE
        );

        crypto.getRandomValues(this.prv);
        Module._ecdh_generate_keys(this.pub_buf, this.prv_buf);

        const auth = this.getInitialAuthCommand(this.pub);
        console.log("Sending first auth");
        await this.Band.writeChunkedValue(
            this.Band.Chars.CHUNKED_WRITE,
            CHUNK_ENDPOINTS.AUTH,
            this.Band.getNextHandle(),
            Uint8Array.from(auth)
        );

        await new Promise((resolve, reject) => {
            this.addEventListener('authentication_result', function (e) {
                //console.log(e)
                resolve(e.detail); // done
            });
        });
        
        // Unhook
        await this.Band.GATT.stopNotifications(this.Band.Chars.CHUNKED_READ, self.listenerOnChunk);

        return new Promise((resolve, reject) => {resolve(true)})
    }

    getInitialAuthCommand(publicKey) {
        return [0x04, 0x02, 0x00, 0x02, ...publicKey];
    }

    async onChunkedRead (e) {
        const value = new Uint8Array(e.target.value.buffer);
        console.log("authenticator notified");

        if (value.length > 1 && value[0] == 0x03) {
            const sequenceNumber = value[4];
            let headerSize;
            if (
                sequenceNumber == 0 &&
                value[9] == CHUNK_ENDPOINTS.AUTH &&
                value[10] == 0x00 &&
                value[11] == 0x10 &&
                value[12] == 0x04 &&
                value[13] == 0x01
            ) {
                this.reassembleBuffer_pointer = 0;
                headerSize = 14;
                this.reassembleBuffer_expectedBytes = value[5] - 3;
            } else if (sequenceNumber > 0) {
                if (sequenceNumber != this.lastSequenceNumber + 1) {
                    console.log("Unexpected sequence number");
                    new CustomEvent('authentication_result', {detail:false})
                    return false;
                }
                headerSize = 5;
            } else if (
                value[9] == CHUNK_ENDPOINTS.AUTH &&
                value[10] == 0x00 &&
                value[11] == 0x10 &&
                value[12] == 0x05 &&
                value[13] == 0x01
            ) {
                console.log("Successfully authenticated");
                this.dispatchEvent(new CustomEvent('authentication_result', {detail:true}))
                return true;
            } else {
                console.log("Unhandled characteristic change");
                console.log();
                new CustomEvent('authentication_result', {detail:false})
                return false;
            }

            const bytesToCopy = value.length - headerSize;
            this.reassembleBuffer.set(
                new Uint8Array(value).subarray(headerSize),
                this.reassembleBuffer_pointer
            );

            this.reassembleBuffer_pointer += bytesToCopy;
            this.lastSequenceNumber = sequenceNumber;

            if (this.reassembleBuffer_pointer == this.reassembleBuffer_expectedBytes) {
                const remoteRandom = new Uint8Array(
                    this.reassembleBuffer.subarray(0, 16)
                );
                const remotePublicEC = new Uint8Array(
                    this.reassembleBuffer.subarray(16, 64)
                );

                const rpub_buf = Module._malloc(this.ECC_PUB_KEY_SIZE);
                const rpub = Module.HEAPU8.subarray(
                    rpub_buf,
                    rpub_buf + this.ECC_PUB_KEY_SIZE
                );
                rpub.set(remotePublicEC);

                const sec_buf = Module._malloc(this.ECC_PUB_KEY_SIZE);
                const sec = Module.HEAPU8.subarray(
                    sec_buf,
                    sec_buf + this.ECC_PUB_KEY_SIZE
                );

                Module._ecdh_shared_secret(this.prv_buf, rpub_buf, sec_buf);

                this.encryptedSequenceNr =
                    (sec[0] & 0xff) |
                    ((sec[1] & 0xff) << 8) |
                    ((sec[2] & 0xff) << 16) |
                    ((sec[3] & 0xff) << 24);

                const secretKey = aesjs.utils.hex.toBytes(this.Band.authKey);
                this.secretKey = secretKey
                console.log(this.secretKey);
                const finalSharedSessionAES = new Uint8Array(16);
                for (let i = 0; i < 16; i++) {
                    finalSharedSessionAES[i] = sec[i + 8] ^ this.secretKey[i];
                }
                this.sharedSessionKey = finalSharedSessionAES;
                //console.log(this.sharedSessionKey)

                const aesCbc1 = new aesjs.ModeOfOperation.cbc(this.secretKey);
                const out1 = aesCbc1.encrypt(remoteRandom);
                const aesCbc2 = new aesjs.ModeOfOperation.cbc(this.sharedSessionKey);
                const out2 = aesCbc2.encrypt(remoteRandom);

                if (out1.length == 16 && out2.length == 16) {
                    const command = new Uint8Array(33);
                    command[0] = 0x05;
                    command.set(out1, 1);
                    command.set(out2, 17);
                    console.log("Sending 2nd auth part");
                    await this.Band.writeChunkedValue(
                        this.Band.Chars.CHUNKED_WRITE,
                        CHUNK_ENDPOINTS.AUTH,
                        this.Band.getNextHandle(),
                        command
                    );
                }
            }
            return true;
        }
    }
}