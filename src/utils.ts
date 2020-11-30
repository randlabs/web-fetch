//License: Apache 2.0. See LICENSE.md
import * as Types from "./types";

// -----------------------------------------------------------------------------

export function toUtf8(data?: Uint8Array | null): string {
	const s = [];

	if (!data) {
		return "";
	}

	let i = 0;
	while (i < data.byteLength) {
		let c = data[i];
		i += 1;

		if (c > 127) {
			if (c > 191 && c < 224) {
				if (i >= data.byteLength) {
					throw new Error('UTF-8 decode: incomplete 2-byte sequence');
				}
				c = ((c & 31) << 6) | (data[i] & 63);
				i += 1;
			}
			else if (c > 223 && c < 240) {
				if (i + 1 >= data.byteLength) {
					throw new Error('UTF-8 decode: incomplete 3-byte sequence');
				}
				c = ((c & 15) << 12) | ((data[i] & 63) << 6) | (data[i + 1] & 63);
				i += 2;
			}
			else if (c > 239 && c < 248) {
				if (i + 2 >= data.byteLength) {
					throw new Error('UTF-8 decode: incomplete 4-byte sequence');
				}
				c = ((c & 7) << 18) | ((data[i] & 63) << 12) | ((data[i + 1] & 63) << 6) | (data[i + 2] & 63);
				i += 3;
			}
			else {
				throw new Error('UTF-8 decode: unknown multibyte start 0x' + c.toString(16) + ' at index ' + (i - 1));
			}
		}
		if (c <= 0xffff) {
			s.push(String.fromCharCode(c));
		}
		else if (c <= 0x10FFFF) {
			c -= 0x10000;
			s.push(String.fromCharCode((c >> 10) | 0xD800));
			s.push(String.fromCharCode((c & 0x3FF) | 0xDC00));
		}
		else {
			throw new Error('UTF-8 decode: code point 0x' + c.toString(16) + ' exceeds UTF-16 reach');
		}
	}
	return s.join('');
}

export function toJSON(data?: Uint8Array | null, parser?: Types.JSONParser | null): any {
	if (!data) {
		return {};
	}

	const s = toUtf8(data);
	if (parser)
		return parser(s);
	return JSON.parse(s);
}
