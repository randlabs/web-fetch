//License: Apache 2.0. See LICENSE.md
import * as axios from "axios";
import { AbortSignal } from "./AbortSignal";
import { FetchError } from "./error";
import Response from "./response";
import { Headers, JSONParser } from "./types";

// -----------------------------------------------------------------------------

export interface Options {
	method?: "GET" | "POST" | "PUT" | "DELETE" | "OPTIONS";
	headers?: Headers | null;
	params?: Record<string, string> | null;
	body?: any;
	maxRedirects?: number;
	signal?: AbortSignal | null;
	maxBodySize?: number | null;
	timeout?: number | null;
	auth?: CredentialsOptions | null;
	proxy?: ProxyOptions | null;
}

export interface CredentialsOptions {
	username: string;
	password: string;
}

export interface ProxyOptions {
	host: string;
	port: number;
	auth?: {
		username: string;
		password:string;
	};
	protocol?: string;
}

export interface JSONOptions extends Options {
	parser?: JSONParser | null;
}

export { FetchError } from "./error";

interface DefaultOptions {
	maxRedirects: number;
	maxBodySize: number | null;
	timeout: number | null;
	auth: CredentialsOptions | null;
	proxy: ProxyOptions | null;
	jsonParser: JSONParser | null;
}

export const defaults: DefaultOptions = {
	maxRedirects: 10,
	maxBodySize: Infinity,
	timeout: 10,
	auth: null,
	proxy: null,
	jsonParser: null
};

// -----------------------------------------------------------------------------

export async function fetch(url: string, options?: Options): Promise<Response> {
	let abortSignalListener: (event: any) => any | undefined;

	const axiosOptions: axios.AxiosRequestConfig = {
		method: (options && options.method) ? options.method : "GET",
		url,
		...(options && options.headers && { headers: options.headers }),
		...(options && options.params && { params: options.params }),
		...(options && options.body && { data: options.body }),
		...(options && options.timeout && { timeout: options.timeout }),
		...(options && options.maxRedirects != null && { maxRedirects: options.maxRedirects }),
		...(options && options.auth && { auth: options.auth }),
		...(options && options.proxy && { proxy: options.proxy }),
		...(options && options.maxBodySize && {
			maxContentLength: options.maxBodySize,
			maxBodyLength: options.maxBodySize
		}),
		responseType: "arraybuffer"
	};

	if (typeof axiosOptions.maxRedirects == null) {
		axiosOptions.maxRedirects = (defaults.maxRedirects != null) ? defaults.maxRedirects : 10;
	}
	if (typeof axiosOptions.maxContentLength == null) {
		axiosOptions.maxContentLength = (defaults.maxBodySize != null) ? defaults.maxBodySize : Infinity;
		axiosOptions.maxBodyLength = axiosOptions.maxContentLength;
	}
	if (typeof axiosOptions.timeout == null) {
		axiosOptions.timeout = (defaults.timeout != null) ? defaults.timeout : 10;
	}
	if (typeof axiosOptions.auth == null && defaults.auth != null) {
		axiosOptions.auth = defaults.auth;
	}
	if (typeof axiosOptions.proxy == null && defaults.proxy != null) {
		axiosOptions.proxy = defaults.proxy;
	}

	if (options && options.signal) {
		//create a CancelToken to wrap the AbortSignal
		const source = axios.default.CancelToken.source();

		axiosOptions.cancelToken = source.token;

		abortSignalListener = (() => {
			source.cancel();
		});

		options.signal.addEventListener("abort", abortSignalListener);
	}

	let response: axios.AxiosResponse;
	try {
		response = await axios.default(axiosOptions);
	}
	catch (fetchErr) {
		let err: FetchError;

		if (axios.default.isCancel(fetchErr)) {
			err = new FetchError("request canceled by user", "abort");
		}
		else if (fetchErr.message.startsWith("timeout")) {
			err = new FetchError(fetchErr.message, "timeout");
			err.canRetry = true;
		}
		else if (fetchErr.response) {
			// The request was made and the server responded with a status code
			// that falls out of the range of 2xx
			err = new FetchError(
				fetchErr.message, "unsuccessful",
				fetchErr.response.data, fetchErr.response.status, fetchErr.response.headers
			);

			if (err.status === 429) { //Too many requests? We can retry
				err.canRetry = true;
			}
		}
		else if (fetchErr.request) {
			// We were unable to get a response
			err = new FetchError(fetchErr.message, "unsuccessful");
		}
		else {
			// Something happened while setting up the request that triggered an error
			err = new FetchError(fetchErr.message, "system");
		}

		// If it is a network error, we can retry
		if (fetchErr.message === "Network Error") {
			err.canRetry = true;
		}
		if (fetchErr.code) {
			err.code = fetchErr.code;
			if (typeof err.code === "string") {
				switch (err.code) {
					case "ECONNREFUSED":
					case "ECONNRESET":
					case "ECONNABORTED":
					case "EHOSTUNREACH":
					case "EHOSTDOWN":
						err.canRetry = true;
						break;
				}
			}
		}

		// Augment our error
		err.errno = fetchErr.errno;
		err.syscall = fetchErr.syscall;
		if (fetchErr.stack) {
			err.stack = fetchErr.stack;
		}

		//throw
		throw err;
	}
	finally {
		if (options && options.signal) {
			options.signal.removeEventListener("abort", abortSignalListener!);
		}
	}

	//done
	return new Response(response.data, response.status, response.headers);
}

export async function fetchJSON<T = any>(url: string, options?: JSONOptions): Promise<T> {
	const res = await fetch(url, options);

	let parser = null;
	if (options) {
		parser = options.parser ? options.parser : defaults.jsonParser;
	}

	return res.toJSON(parser) as T;
}
