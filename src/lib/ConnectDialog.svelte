<script lang="ts">
	import { invoke } from '@tauri-apps/api/tauri';
	import {
		Modal,
		Grid,
		Stack,
		Flex,
		Group,
		Divider,
		Button,
		ActionIcon,
		Title,
		Text,
		TextInput,
		Switch,
		NativeSelect,
		NumberInput,
		PasswordInput
	} from '@svelteuidev/core';
	import { Plus, Trash, Gear, Rocket } from 'radix-icons-svelte';
	import ConnectionItem from '$lib/ConnectionItem.svelte';
	import { connections_store, Connection } from '$lib/stores/connections';
	import { connection_status, connectedhost, connecting } from '$lib/stores/connection_status';

	let tls = false;
	let validate = true;
	let current_connection = $connections_store[0] || new Connection('', 'mqtt://', '', 1883);

	function newConnection() {
		current_connection = new Connection('', 'mqtt://', '', 1883);
	}

	function saveConnection() {
		let indexToUpdate = $connections_store.findIndex((item) => item.id === current_connection.id);
		if (indexToUpdate < 0) $connections_store = [...$connections_store, current_connection];
		else $connections_store[indexToUpdate] = current_connection;
	}

	function deleteConnection() {
		$connections_store = $connections_store.filter((obj) => {
			return obj.id !== current_connection.id;
		});
		current_connection = $connections_store[0] || new Connection('', 'mqtt://', '', 1883);
	}

	async function connect() {
		$connectedhost = current_connection.host;
		connecting();
		await invoke('connect', {
			name: crypto.randomUUID(),
			host: current_connection.host,
			port: current_connection.port,
			username: current_connection.username,
			password: current_connection.password
		});
	}
</script>

<Modal centered opened={!$connection_status.connected} withCloseButton={false} size={840}>
	<Grid spacing="xs">
		<Grid.Col span={3}>
			<Stack align="strech">
				<Flex wrap="nowrap" gap="md" align="flex-end"
					><ActionIcon
						on:click={newConnection}
						color="blue"
						size="md"
						radius="xl"
						variant="filled"
						title="add"><Plus size={20} /></ActionIcon
					>Connections</Flex
				>
				{#each $connections_store as connection, i}
					<ConnectionItem {connection} on:click={(event) => (current_connection = event.detail)} />
				{/each}
			</Stack>
		</Grid.Col>
		<Grid.Col span={1}>
			<Divider orientation="vertical" />
		</Grid.Col>
		<Grid.Col span={8}>
			<Grid cols={4} justify="space-between" align="flex-end">
				<Grid.Col span={4}>
					<Title order={1}
						>MQTT Connection <Text size="sm" color="dimmed"
							>{current_connection.protocol}{current_connection.host}:{current_connection.port}</Text
						></Title
					>
				</Grid.Col>
				<Grid.Col span={2}>
					<TextInput
						placeholder="new connection"
						label="Name"
						bind:value={current_connection.name}
					/>
				</Grid.Col>
				<Grid.Col span={1}>
					<Switch bind:checked={validate} size="xs" label="Validate certificate" />
				</Grid.Col>
				<Grid.Col span={1}>
					<Switch bind:checked={tls} size="xs" label="Encryption (tls)" />
				</Grid.Col>
				<Grid.Col span={1}>
					<NativeSelect
						data={['mqtt://', 'ws://']}
						bind:value={current_connection.protocol}
						label="Protocol"
					/>
				</Grid.Col>
				<Grid.Col span={2}>
					<TextInput bind:value={current_connection.host} placeholder="Host" label="Host" />
				</Grid.Col>
				<Grid.Col span={1}>
					<NumberInput bind:value={current_connection.port} label="Port" hideControls />
				</Grid.Col>
				<Grid.Col span={2}>
					<TextInput bind:value={current_connection.username} label="Username" />
				</Grid.Col>
				<Grid.Col span={2}>
					<PasswordInput bind:value={current_connection.password} label="Password" />
				</Grid.Col>
				<Grid.Col span={4}>
					<Flex justify="space-between" wrap="nowrap"
						><Group
							><Button variant="outline" on:click={deleteConnection}
								><Trash slot="leftIcon" size={18} />Delete</Button
							><Button variant="outline"><Gear slot="leftIcon" size={18} />Advanced</Button></Group
						><Group
							><Button ripple on:click={saveConnection}>Save</Button>
							<Button
								on:click={connect}
								variant="default"
								loading={$connection_status.connecting}
								loaderProps={{ size: 'sm', variant: 'circle' }}
								><Rocket slot="leftIcon" />Connect</Button
							></Group
						></Flex
					>
				</Grid.Col>
			</Grid>
		</Grid.Col>
	</Grid>
</Modal>
