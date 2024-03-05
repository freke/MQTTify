import { type ConnectionOptions } from '$lib/stores/connections.svelte'

export enum ConnectionHealth {
	OK,
	UNSTABLE,
}

export enum ConnecitonStatus {
	OFFLINE,
	CONNECTING,
	CONNECTED,
}

type Connection = {
	connection_options?: ConnectionOptions
	connection_status: ConnecitonStatus
	connection_health: ConnectionHealth
}

export function connection_status(): Connection {
	const connection_status = $state({
		connection_status: ConnecitonStatus.OFFLINE,
		connection_health: ConnectionHealth.OK,
	})
	return connection_status
}
