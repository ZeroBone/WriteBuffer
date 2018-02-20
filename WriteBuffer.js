"use strict";

const Long = require("./Long");

class WriteBuffer {

    constructor() {

        this._size = 0;

        this._rendered = false;

        this._renderActions = [];

        this._buffer = null;

    }

    _requestWrite(bytes) {

        this._size += bytes;

    }

    _render() {

        if (this._rendered) {

            return;

        }

        // console.time("write render");

        this._buffer = Buffer.allocUnsafe(this._size);



        for (const renderAction of this._renderActions) {

            renderAction.callback(this._buffer, renderAction.offset, renderAction.value, renderAction.userData);

        }

        // console.timeEnd("write render");

        // delete this._renderActions;

        this._rendered = true;

    }

    _addRenderAction(callback, value, offset, userData) {

        this._renderActions.push({
            callback,
            value,
            offset,
            userData
        });

    }

    getBuffer() {

        this._render();

        return this._buffer;

    }

    // write methods

    /**
     * Writes an unsigned 32 bit integer to the buffer.
     * @param value {Number} the number to write.
     */
    writeUIntBE(value) {

        this._addRenderAction(WriteBuffer._writers.writeUIntBE, value, this._size);

        this._requestWrite(4);

    }

    /**
     * Writes an signed 32 bit integer to the buffer.
     * @param value {Number} the number to write.
     */
    writeIntBE(value) {

        this._addRenderAction(WriteBuffer._writers.writeIntBE, value, this._size);

        this._requestWrite(4);

    }

    /**
     * Writes a UTF8 encoded string.
     * @param string {String} the read string.
     */
    writeUTF8String(string) {

        const stringBytes = Buffer.byteLength(string, "utf8");

        this.writeUIntBE(stringBytes);

        this._addRenderAction(WriteBuffer._writers.writeUTF8String, string, this._size, stringBytes);

        this._requestWrite(stringBytes);

        // this._offset += this._buffer.write(string, this._offset, stringBytes, "utf8");

    }

    /**
     * Writes a signed byte to a buffer. (Maximum 255)
     * @param byte {Number} the number representing the byte.
     */
    writeByte(byte) {

        this._addRenderAction(WriteBuffer._writers.writeByte, byte, this._size);

        this._requestWrite(1);

        // this._buffer[this._offset] = byte;

        // this._offset = this._buffer.writeInt8(byte, this._offset, true);

    }

    /**
     * Writes an unsigned byte to a buffer.
     * @param byte {Number} the number representing the byte.
     */
    writeUByte(byte) {

        this._addRenderAction(WriteBuffer._writers.writeUByte, byte, this._size);

        this._requestWrite(1);

        // this._offset = this._buffer.writeUInt8(byte, this._offset, true);

    }

    /**
     * Writes a byte with a boolean inside.
     * @param boolean {Boolean} value
     */
    writeBoolean(boolean) {

        this.writeUByte(boolean ? 1 : 0);

    }

    /**
     * Writes a 16 bit signed integer.
     * @param value {Number} the number representing the integer.
     */
    writeShortBE(value) {

        this._addRenderAction(WriteBuffer._writers.writeShortBE, value, this._size);

        this._requestWrite(2);

        // this._offset = this._buffer.writeInt16BE(value, this._offset, true);

    }

    /**
     * Writes a 16 bit unsigned integer.
     * @param value {Number} the number representing the integer.
     */
    writeUShortBE(value) {

        this._addRenderAction(WriteBuffer._writers.writeUShortBE, value, this._size);

        this._requestWrite(2);

        // this._requestWrite(2);
        //
        // this._offset = this._buffer.writeUInt16BE(value, this._offset, true);

    }

    /**
     * Writes a 64 bit integer (can be unsigned or signed)
     * @param long {Long} class instance.
     */
    writeLongBE(long) {

        if (long.unsigned) {

            this.writeUIntBE(long.high);

            this.writeUIntBE(long.low);

        }
        else {

            this.writeIntBE(long.high);

            this.writeIntBE(long.low);

        }

    }

    writeFloatBE(value) {

        this._addRenderAction(WriteBuffer._writers.writeFloatBE, value, this._size);

        this._requestWrite(4);

        // this._offset = this._buffer.writeFloatBE(floatValue, this._offset, true);

    }

    // static methods

    static create() {

        return new WriteBuffer();

    }

}

WriteBuffer._writers = {
    writeUIntBE: (buffer, offset, value) => buffer.writeUInt32BE(value, offset, true),
    writeIntBE: (buffer, offset, value) => buffer.writeInt32BE(value, offset, true),
    writeUTF8String: (buffer, offset, value, stringBytes) => buffer.write(value, offset, stringBytes, "utf8"),
    writeByte: (buffer, offset, value) => buffer.writeInt8(value, offset, true),
    writeUByte: (buffer, offset, value) => buffer.writeUInt8(value, offset, true),
    writeShortBE: (buffer, offset, value) => buffer.writeInt16BE(value, offset, true),
    writeUShortBE: (buffer, offset, value) => buffer.writeUInt16BE(value, offset, true),
    writeFloatBE: (buffer, offset, value) => buffer.writeFloatBE(value, offset, true)
};

module.exports = WriteBuffer;