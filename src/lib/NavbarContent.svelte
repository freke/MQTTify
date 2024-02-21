<script language="ts">
	import { Button, Stack, Flex, Text, colorScheme } from '@svelteuidev/core';
	import { Sun, Moon, LockClosed, LockOpen2 } from 'radix-icons-svelte';
	import { edit_locked } from '$lib/stores/edit_locked';
	import { component_store, DashboardComponentType } from '$lib/stores/component_store';

	function toggleTheme() {
		colorScheme.update((v) => (v === 'light' ? 'dark' : 'light'));
	}

	function toggleEditLock() {
		$edit_locked = !$edit_locked;
	}
</script>

<Stack align="strech" justify="flex-start">
	<Flex justify="space-between" align="center" override={{ margin: '10px' }}>
		<Text>Darkmode</Text>
		<Button on:click={toggleTheme} variant="outline" color="gray">
			{#if $colorScheme === 'dark'}
				<Moon />
			{:else}
				<Sun />
			{/if}
		</Button>
	</Flex>
	<Flex justify="space-between" align="center" override={{ margin: '10px' }}>
		<Text>Edit</Text>
		<Button on:click={toggleEditLock} variant="outline" color="gray">
			{#if $edit_locked}
				<LockClosed />
			{:else}
				<LockOpen2 />
			{/if}
		</Button>
	</Flex>
	<Stack justify="flex-start" spacing="xs" override={{ margin: '10px' }}>
		<Text>Dialogs</Text>
		<Flex justify="space-between" align="center">
			<Text>Publish</Text>
			<Button
				on:click={() => component_store.add_new(DashboardComponentType.Publish, 4, 5, {})}>Add</Button
			>
		</Flex>
		<Flex justify="space-between" align="center">
			<Text>Topics</Text>
			<Button
				on:click={() => component_store.add_new(DashboardComponentType.TopicsTree, 4, 2, {})}>Add</Button
			>
		</Flex>
	</Stack>
</Stack>
