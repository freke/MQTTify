<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Text, UnstyledButton } from '@svelteuidev/core';
	import type { Connection } from '$lib/stores/connections';

	export let connection: Connection;

	const dispatch = createEventDispatcher();

	function notify() {
		dispatch('click', connection);
	}
</script>

<UnstyledButton on:click={notify}>
	<Text>{connection.name}</Text>
	<Text size="xs" color="dimmed">{connection.protocol}{connection.host}:{connection.port}</Text>
</UnstyledButton>
