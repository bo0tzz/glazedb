// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	namespace svelteHTML {
		interface IntrinsicElements {
			'hex-color-picker': {
				color?: string;
				'oncolor-changed'?: (e: CustomEvent<{ value: string }>) => void;
			};
		}
	}
}

export {};
