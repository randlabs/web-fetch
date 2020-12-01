//License: Apache 2.0. See LICENSE.md
import * as Types from "./types";
import * as Utils from "./utils";

// -----------------------------------------------------------------------------

type FetchErrorType = "unsuccessful" | "error" | "abort" | "timeout" | "system";

export class FetchError extends Error {
	public name: string;
	public type: FetchErrorType;
	public canRetry: boolean;
	public errno?: string;
	public code?: string;
	public syscall?: string;
	public stack?: string;
	private data: Uint8Array | null;
	private httpStatus?: number;
	private httpHeaders: Types.Headers;

	constructor(
		message: string, type: FetchErrorType,
		data?: Uint8Array | ArrayBuffer | null | undefined, status?: number, headers?: Types.Headers | null
	) {
		super(message);
		this.name = "FetchError";
		this.type = type;
		this.canRetry = false;

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

	toJSON(parser?: Types.JSONParser | null): any {
		return Utils.toJSON(this.data, parser);
	}

	toString(): string {
		return this.toUtf8();
	}

	get status(): number {
		return (this.httpStatus) ? this.httpStatus : 0;
	}

	get headers(): Types.Headers {
		return this.httpHeaders;
	}
}
