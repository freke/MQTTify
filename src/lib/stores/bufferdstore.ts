import { writable, type Writable, type Subscriber } from 'svelte/store';
import { RingBuffer } from 'ring-buffer-ts';

export class BufferedStore<T> {
	private ringBuffer;
	private _store: Writable<T | undefined>;

	constructor(buffer_size: number) {
		this.ringBuffer = new RingBuffer<T>(buffer_size);
		this._store = writable(this.ringBuffer.getLast());
	}

	get(filter: (v: T) => boolean, n?: number) {
		return this.ringBuffer
			.toArray()
			.filter(filter)
			.slice(n ? -n : undefined);
	}

	get_last_n(n: number) {
		return this.ringBuffer.getLastN(n);
	}

	add(...value: T[]) {
		this.ringBuffer.add(...value);
		//this._store.set(this.ringBuffer.getLast());
	}

	clear() {
		this.ringBuffer.clear();
		//this._store.set(this.ringBuffer.getLast());
	}

	subscribe(run: Subscriber<T | undefined>) {
		return this._store.subscribe(run);
	}
}
