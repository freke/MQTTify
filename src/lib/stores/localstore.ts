import { writable, type Subscriber } from 'svelte/store';

export class LocalStore<T> {
	private _store;
	protected key: string;

	constructor(key: string, initial: T) {
		this.key = key;
		if (localStorage.getItem(key) === null) {
			// item not present in local storage
			localStorage.setItem(key, this.toString(initial)); // initialize local storage with initial value
		}

		const saved = this.toObj(localStorage.getItem(key) || '');
		this._store = writable(saved);
	}

	protected toString(value: T): string {
		return JSON.stringify(value, null, 2);
	}

	protected toObj(string: string): T {
		return JSON.parse(string);
	}

	set(value: T) {
		localStorage.setItem(this.key, this.toString(value));
		return this._store.set(value);
	}

	get() {
		return this.toObj(localStorage.getItem(this.key) || '');
	}

	subscribe(run: Subscriber<T>) {
		return this._store.subscribe(run);
	}
}
