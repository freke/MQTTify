import { readonly, writable } from 'svelte/store';
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';
import { addToast } from './toasts';

export enum ConnectionHealth {
	OK,
	OFFLINE,
	CONNECTING,
	UNSTABLE
}
export type ConnectionStatus = {
	connected: boolean;
	connecting: boolean;
	health: ConnectionHealth;
};

let timer: ReturnType<typeof setTimeout>;

export const connectedhost = writable<string>('');

const writableStore = writable<ConnectionStatus>({
	connected: true,
	connecting: false,
	health: ConnectionHealth.OFFLINE
});
export const connection_status = readonly(writableStore);

export function ready() {
	writableStore.set({ connected: false, connecting: false, health: ConnectionHealth.OFFLINE });
}

export function connecting() {
	writableStore.set({ connected: false, connecting: true, health: ConnectionHealth.CONNECTING });
}

function connected() {
	clearTimeout(timer);
	invoke('subscribe', {});
	writableStore.set({ connected: true, connecting: false, health: ConnectionHealth.OK });
	timer = setTimeout(function () {
		writableStore.set({ connected: true, connecting: false, health: ConnectionHealth.UNSTABLE });
	}, 5000);
}

function disconnect() {
	clearTimeout(timer);
	writableStore.set({ connected: false, connecting: false, health: ConnectionHealth.OFFLINE });
}

function got_ping() {
	writableStore.set({ connected: true, connecting: false, health: ConnectionHealth.OK });
	clearTimeout(timer);
	timer = setTimeout(function () {
		writableStore.set({ connected: true, connecting: false, health: ConnectionHealth.UNSTABLE });
	}, 5000);
}

export const mqtt_messages = listen<any>('connection', (event) => {
	if (event.event !== 'connection') {
		return;
	}
	if (event.payload === 'Connected') {
		connected();
		return;
	}
	if (event.payload.Disconnected) {
		disconnect();
		if (event.payload.Disconnected.error) {
			addToast({
				message: event.payload.Disconnected.error,
				type: 'error',
				dismissible: true,
				timeout: 3000
			});
		}
		return;
	}
	if (event.payload === 'Ping') {
		got_ping();
		return;
	}
});

