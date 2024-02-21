import { LocalStore } from './localstore';

export class Connection {
	id: string;

	constructor(
		public name: string,
		public protocol: string,
		public host: string,
		public port: number,
		public username: string | null = null,
		public password: string | null = null
	) {
		this.id = crypto.randomUUID();
	}
}

export const connections_store = new LocalStore<Connection[]>('connections', []);
