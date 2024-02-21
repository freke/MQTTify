<script language="ts">
	import { invoke } from '@tauri-apps/api/tauri';
	import { LinkBreak1, Share1, LockClosed, LockOpen2 } from 'radix-icons-svelte';
	import { Flex, Button, ThemeIcon, ActionIcon } from '@svelteuidev/core';
	import { connection_status, ConnectionHealth } from '$lib/stores/connection_status';
	import { edit_locked } from '$lib/stores/edit_locked';

	async function disconnect() {
		await invoke('disconnect', {});
	}

	let color = 'gray';

	$: {
		switch ($connection_status.health) {
			case ConnectionHealth.CONNECTING: {
				color = 'gray';
				break;
			}
			case ConnectionHealth.OK: {
				color = 'green';
				break;
			}
			case ConnectionHealth.OFFLINE: {
				color = 'red';
				break;
			}
			case ConnectionHealth.UNSTABLE: {
				color = 'yellow';
				break;
			}
		}
	}

	function toggleEditLock() {
		$edit_locked = !$edit_locked;
	}
</script>

<Flex gap="md" justify="space-around">
	<ThemeIcon {color} size="lg" radius="md" variant="filled">
		<Share1 />
	</ThemeIcon>
	<Button on:click={disconnect}><LinkBreak1 slot="leftIcon" size={18} />Disconnect</Button>
	<ActionIcon on:click={toggleEditLock} variant="filled" radius="md" color="gray" size="lg">
		{#if $edit_locked}
			<LockClosed/>
		{:else}
			<LockOpen2/>
		{/if}
	</ActionIcon>
</Flex>
