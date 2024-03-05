<script lang="ts">
	import {
		new_connection,
		connections,
		subscriptions,
		new_subscription,
		Protocols,
		QoS,
		type Subscription,
		type ConnectionOptions,
	} from '$lib/stores/connections.svelte'
	import ConnectionItem from './ConnectionItem.svelte'
	import SubscriptionItem from './SubscriptionItem.svelte'

	let { onconnect } = $props<{ onconnect: (connection: ConnectionOptions) => void }>()

	function addConnection() {
		current_connection = new_connection('', Protocols.MQTT, '', 1883)
		connections_store.add(current_connection)
	}

	function saveConnection() {
		connections_store.save(current_connection)
	}

	function deleteConnection() {
		connections_store.delete(current_connection)
		current_connection = new_connection('', Protocols.MQTT, '', 1883)
	}

	async function connect() {
		onconnect(current_connection)
	}

	function selected(id: string) {
		current_connection =
			connections_store.connections.find((obj) => obj.id === id) ||
			new_connection('', Protocols.MQTT, '', 1883)
	}

	function add_subscription() {
		subscriptions_store.add(new_subscription(topic, qos))
		topic = ''
		qos = QoS.AtLeastOnce
	}

	function delete_subscription(subscription: Subscription) {
		subscriptions_store.delete(subscription)
	}

	let tls = $state(false)
	let validate = $state(true)
	let connections_store = connections()
	let current_connection = $state(
		connections_store.connections[0] || new_connection('', Protocols.MQTT, '', 1883),
	)
	let advanced = $state(false)
	let subscriptions_store = $derived(subscriptions(current_connection))
	let topic = $state('')
	let qos = $state(QoS.AtLeastOnce)
</script>

<div>
	<h2>
		MQTT Connection <div>
			{current_connection.protocol}{current_connection.host}:{current_connection.port}
		</div>
	</h2>
	<h2>Connections:</h2>
	<button onclick={addConnection}>Add</button>
	<div>
		{#each connections_store.connections as connection}
			<ConnectionItem {connection} onselect={selected} />
		{/each}
	</div>
	{#if advanced}
		<table>
			<thead><tr><th></th><th>Topic</th><th>QoS</th></tr></thead>
			<tbody>
				<tr>
					<td>
						<button onclick={add_subscription}>Add</button>
					</td>
					<td>
						<label for="new_subscription">New Subscription</label>
						<input id="new_subscription" bind:value={topic} />
					</td>
					<td>
						<label for="qos">QoS</label>
						<select id="qos" bind:value={qos}>
							{#each Object.values(QoS).filter((v) => isNaN(Number(v))) as qos}
								<option value={QoS[qos as number]}>{qos}</option>
							{/each}
						</select>
					</td>
				</tr>
				{#each subscriptions_store.subscriptions as subscription}
					<SubscriptionItem {subscription} ondelete={delete_subscription} />
				{/each}
			</tbody>
		</table>
		<label for="client_id">MQTT Client ID</label>
		<input id="client_id" bind:value={current_connection.client_id} />
		<button>Certificate</button>
		<button onclick={() => (advanced = !advanced)}>Back</button>
	{:else}
		<label for="name">Name</label>
		<input id="name" bind:value={current_connection.name} />
		<label for="cert_validate">Validate certificate</label>
		<input type="checkbox" id="cert_validate" bind:checked={validate} />
		<label for="tls">Encryption (tls)</label>
		<input type="checkbox" id="tls" bind:checked={tls} />
		<label for="protocol">Protocol</label>
		<select id="protocol">
			{#each Object.entries(Protocols) as [protocol, protocol_name]}
				<option value={protocol}>{protocol_name}</option>
			{/each}
		</select>
		<label for="host">Host</label>
		<input id="host" bind:value={current_connection.host} placeholder="Host" />
		<label for="port">Port</label>
		<input id="port" bind:value={current_connection.port} type="number" />
		<label for="username">Username</label>
		<input id="username" bind:value={current_connection.username} />
		<label for="password">Password</label>
		<input id="password" bind:value={current_connection.password} type="password" />
		<button onclick={deleteConnection}>Delete</button>
		<button onclick={() => (advanced = !advanced)}>Advanced</button>
		<button onclick={saveConnection}>Save</button>
		<button onclick={connect}>Connect</button>
	{/if}
</div>
