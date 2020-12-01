//License: Apache 2.0. See LICENSE.md

// -----------------------------------------------------------------------------

//NOTE: Generic abort signal definition to avoid a specific dependency/implementation

type EventListener = ((this: AbortSignal, event: any) => any);

export interface AbortSignal {
	aborted: boolean;

	addEventListener: (type: "abort", listener: EventListener, options?: boolean | {
		capture?: boolean,
		once?: boolean,
		passive?: boolean
	}) => void;

	removeEventListener: (type: "abort", listener: EventListener, options?: boolean | {
		capture?: boolean
	}) => void;

	dispatchEvent: (event: any) => boolean;

	onabort?: ((this: AbortSignal, event: any) => void) | null;
}
