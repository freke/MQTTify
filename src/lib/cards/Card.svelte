<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Paper, Title, ActionIcon } from '@svelteuidev/core';
	import { Cross2 } from 'radix-icons-svelte';

	export let id: string;
	export let title = '';

	export let height = '100%';
	export let width = '100%';

	const dispatch = createEventDispatcher();

	const close_button = {
		position: 'absolute',
		top: '3px',
		right: '3px',
		margin: '3px'
	};
</script>

<Paper
	shadow="sm"
	padding="lg"
	withBorder
	override={{ height: height, width: width, overflow: 'auto' }}
>
	<Title order={2}>{title}</Title>
	<ActionIcon override={close_button} on:click={() => dispatch('close', id)}
		><Cross2 /></ActionIcon
	>
	<slot />
</Paper>
