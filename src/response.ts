//License: Apache 2.0. See LICENSE.md
import { Headers, JSONParser } from "./types";
import * as Utils from "./utils";

// -----------------------------------------------------------------------------

export class Response {
	private data: Uint8Array | null;
	private httpStatus: number;
	private httpHeaders: Headers;

	constructor(data: Uint8Array | ArrayBuffer | null | undefined, status: number, headers: Headers | null) {
		if (data) {
			this.data = (data instanceof Uint8Array) ? data : new Uint8Array(data);
		}
		else {
			this.data = null;
		}
		this.httpStatus = status;
		this.httpHeaders = (headers) ? headers : {};
	}

	toBuffer(): Uint8Array | null {
		return this.data;
	}

	toUtf8(): string {
		return Utils.toUtf8(this.data);
	}

	toJSON(parser?: JSONParser | null): any {
		return Utils.toJSON(this.data, parser);
	}

	toString(): string {
		return this.toUtf8();
	}

	get status(): number {
		return this.httpStatus;
	}

	get headers(): Headers {
		return this.httpHeaders;
	}
}
