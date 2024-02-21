<script lang="ts">
	import type { Topic } from '$lib/stores/topic_store';
	import { ActionIcon, Text, Flex } from '@svelteuidev/core';
	import { ChevronDown, ChevronRight, ExternalLink } from 'radix-icons-svelte';
	import { derived, type Writable } from 'svelte/store';
	import { component_store, DashboardComponentType } from '$lib/stores/component_store';

	export let topic: Topic;
	export let topics: Writable<Topic[]>;
	export let expand = false;
	export let indent = 0;

	function toggleOpen() {
		expand = !expand;
	}

	const countDisplay = derived(
		[topics, topic.message_counter],
		([$topics, $message_counter]) => $message_counter > 0 ? `(topics:${$topics.length}, messages: ${$message_counter})` : ''
	);
</script>

<style>
	.topics {
		max-width: 100%;
	}

	.topic {
		word-break: break-all;
	}

	.counter {
		white-space: nowrap;
	}

	.payload {
		word-break: break-all;
	}
</style>

<div class="topics">
	<div style="padding-left: {indent}px">
		<Flex wrap="nowrap" align="center" gap="sm">
			{#if $topics.length > 0}
				<ActionIcon on:click={toggleOpen}>
					{#if expand}
						<ChevronDown />
					{:else}
						<ChevronRight />
					{/if}
				</ActionIcon>
			{/if}
			<div class="topic">
				<Text lineClamp={1}>{topic.topic}</Text>
			</div>
			<div class="counter">
				<Text size="xs" color="dimmed">{$countDisplay}</Text>
			</div>
			{#if topic.payload}
				<Text size="xs">=</Text>
				<div class="payload">
					<Text size="xs" lineClamp={1}>{topic.payload}</Text>
				</div>
				<ActionIcon on:click={() => component_store.add_new(DashboardComponentType.TopicMessages, 4, 2, {id: topic.id})}>
					<ExternalLink />
				</ActionIcon>
			{/if}
		</Flex>
	</div>
	{#if expand}
		{#each $topics as topic(topic.id)}
			<svelte:self bind:topic={topic} bind:topics={topic.sub_topics} indent={indent + 24} />
		{/each}
	{/if}
</div>
