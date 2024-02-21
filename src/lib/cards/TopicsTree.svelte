<script lang="ts">
	import { Topic, topic_store } from '$lib/stores/topic_store';
	import { connectedhost } from '$lib/stores/connection_status';
	import { ActionIcon, TextInput } from '@svelteuidev/core';
	import { Gear } from 'radix-icons-svelte';
	import { slide } from 'svelte/transition';
	import Node from '$lib/components/Node.svelte';

	let config = false;
	export let props: { filter: string };

	const config_button = {
		position: 'absolute',
		top: '3px',
		right: '30px',
		margin: '3px'
	};
</script>

<style>
	.topics {
		overflow-y:auto;
		overflow-x: hidden;
		height: 90%;
		width: 100%;
	}
</style>

<ActionIcon override={config_button} on:click={() => (config = !config)}><Gear /></ActionIcon>
{#if config}
	<div out:slide={{ duration: 150, axis: 'x' }} in:slide={{ delay: 200, axis: 'x' }}>
		<TextInput bind:value={props.filter} placeholder="topic" label="Filter" />
	</div>
{:else}
	<div class="topics" out:slide={{ duration: 150, axis: 'x' }} in:slide={{ delay: 200, axis: 'x' }}>
		<Node topic={new Topic($connectedhost)} topics={topic_store.sub_topics} />
	</div>
{/if}
