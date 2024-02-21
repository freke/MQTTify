import { writable, type Writable, type Subscriber } from 'svelte/store';

export const message_store = writable<string[]>([]);
