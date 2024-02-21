<script lang="ts">
	import { invoke } from '@tauri-apps/api/tauri';
	import { Stack, TextInput, JsonInput, Button, ActionIcon } from '@svelteuidev/core';
	import { PaperPlane, FontFamily } from 'radix-icons-svelte';
	import { evaluate, Operator, type Stack as FunStack } from '$lib/functions/stack';
	import { slide } from 'svelte/transition';
	import Fun from '$lib/fun.svelte';

	var variables: FunStack[] = [
		[Operator.Add, Operator.Add, 'x', 2, 3],
		[Operator.Add, 2, 2]
	];

	async function publish() {
		let v = variables.map(evaluate);
		console.log(variables, v);
		await invoke('publish', {
			topic: topic,
			payload: payload.format(...v)
		});
	}

	let topic: string;
	let payload: string;
	let config = false;

	if (!String.prototype.format) {
		String.prototype.format = function () {
			var args = arguments;
			return this.replace(/{(\d+)}/g, function (match, number) {
				return typeof args[number] != 'undefined' ? args[number] : match;
			});
		};
	}

	const config_button = {
		position: 'absolute',
		top: '3px',
		right: '30px',
		margin: '3px'
	};
</script>

<ActionIcon override={config_button} on:click={() => (config = !config)}><FontFamily /></ActionIcon>
{#if config}
	<div out:slide={{ duration: 150, axis: 'x' }} in:slide={{ delay: 200, axis: 'x' }}>
		<Fun stack={variables[1]}></Fun>
	</div>
{:else}
	<div class="full" out:slide={{ duration: 150, axis: 'x' }} in:slide={{ delay: 200, axis: 'x' }}>
		<Stack align="strech" justify="strech" override={{ height: '100%' }}>
			<TextInput placeholder="my/topic" label="Topic" bind:value={topic} />
			<JsonInput
				id="textarea_publish"
				placeholder={'{ "key" : "value" }'}
				label="Payload"
				formatOnBlur
				validationError="Invalid JSON"
				bind:value={payload}
				override={{ height: '100%' }}
			/>
			<Button on:click={publish}><PaperPlane slot="leftIcon" />Publish</Button>
		</Stack>
	</div>
{/if}

<style>
	.full {
		height: calc(100% - 30px);
	}
	:global(div:has(> #textarea_publish)) {
		height: calc(100% - 30px);
	}

	:global(#textarea_publish) {
		height: 100%;
	}
</style>
