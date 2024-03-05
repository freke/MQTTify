<script lang="ts">
	import { type Topic } from '$lib/stores/topics_tree.svelte'
	import type { EasingFunction, TransitionConfig } from 'svelte/transition'

	let {
		topic,
		onselecttopic,
		indent = 0,
	} = $props<{ topic: Topic; onselecttopic: (topic: Topic) => void; indent: number }>()

	function toggleOpen() {
		topic.open = !topic.open
	}

	const max_payload_length = 30
	let payload_disp = $derived.by(() => {
		if (!topic.payload) return ''
		let post_fix = ''
		if (topic.payload.toString().length > max_payload_length) post_fix = '...'
		return ' = ' + topic.payload.toString().substring(0, max_payload_length) + post_fix
	})

	let topic_disp = $derived.by(() => {
		let post_fix = ''
		if (topic.topic.length > max_payload_length) post_fix = '...'
		return topic.topic.substring(0, max_payload_length) + post_fix
	})

	interface SwipeColorParams {
		duration?: number,
		delay?: number,
		easing?: EasingFunction
	}

/* 	function swipeColor(node: Element, params?: SwipeColorParams): TransitionConfig {
		const { duration, delay, easing } = params || {}
		const color = "rgba(200,200,200,0.5)"
		return {
			duration,
			delay,
			easing,
			css(t) {
				if (t > 0.5) {
					// transform t from range [0.5, 1] into percentage [0, 100]
					// t: 0.5 -> 1
					// u: 0 -> 0.5
					const u = t - 0.5
					// percentage: 0 -> 100
					const percentage = u * 200
					return `background: linear-gradient(to right, transparent 0, ${percentage}%, ${color} ${percentage}%);`
				} else {
					// transform t from range [0, 0.5] into percentage [0, 100]
					// t: 0 -> 0.5
					// percentage: 0 -> 100
					const percentage = t * 200
					return `background: linear-gradient(to right, ${color} 0, ${percentage}%, transparent ${percentage}%);`
				}
			},
		}
	} */

	let message_counter = $derived(topic.message_counter());
</script>

<div class="topic" style="padding-left: {indent}px">
	{#if topic.sub_topics().length > 0}
		<button onclick={toggleOpen}>{topic.open ? 'open' : 'closed'}</button>
	{/if}
	<!-- Memory leak(???) {#key message_counter}
		<span in:swipeColor={{ duration: 150 }}>{topic_disp} (topics: {topic.sub_topics().length}, msg: {message_counter}) {payload_disp}</span>
	{/key} -->
	<span>{topic_disp} (topics: {topic.sub_topics().length}, msg: {message_counter}) {payload_disp}</span>
	{#if topic.payload}
		<button
			onclick={() => {
				onselecttopic(topic)
			}}>Info</button
		>
	{/if}
	{#if topic.open}
		{#each topic.sub_topics() as sub_topic}
			<svelte:self topic={sub_topic} {onselecttopic} indent={indent + 24} />
		{/each}
	{/if}
</div>

<style>
	.topic {
		background-color: transparent;
	}
</style>
