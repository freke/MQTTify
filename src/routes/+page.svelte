<script lang="ts">
	import { onMount } from 'svelte';
	import Card from '$lib/cards/Card.svelte';
	import { fade } from 'svelte/transition';
	import ConnectDialog from '$lib/ConnectDialog.svelte';
	import { listen } from '@tauri-apps/api/event';
	import { addToast } from '../lib/stores/toasts';
	import Grid, { GridItem, type GridController } from 'svelte-grid-extended';
	import { ready } from '$lib/stores/connection_status';
	import { edit_locked } from '$lib/stores/edit_locked';
	import { component_store, DashboardComponentType } from '$lib/stores/component_store';

	import TopicsTree from '$lib/cards/TopicsTree.svelte';
	import Publish from '$lib/cards/Publish.svelte';
	import TopicMessages from '$lib/cards/TopicMessages.svelte';
	import TopicMessagesGraph from '$lib/cards/TopicMessagesGraph.svelte';

	let gridController: GridController;

	onMount(async () => {
		const unlisten = await listen<any>('error', (event) => {
			if (event.event !== 'error') {
				return;
			}
			if (event.payload.Error) {
				if (event.payload.Error.error) {
					addToast({
						message: event.payload.Error.error,
						type: 'error',
						dismissible: true,
						timeout: 3000
					});
				}
				return;
			}
		});

		ready();

		component_store.gridController = gridController;
	});

	$: {
		for (let component of $component_store) {
			if (!component.component) {
				switch (component.component_type) {
					case DashboardComponentType.TopicsTree:
						component.component = TopicsTree;
						break;
					case DashboardComponentType.Publish:
						component.component = Publish;
						break;
					case DashboardComponentType.TopicMessages:
						component.component = TopicMessages;
						break;
					case DashboardComponentType.TopicMessagesGraph:
						component.component = TopicMessagesGraph;
						break;
				}
			}
		}
	}
	const itemSize = { width: 100, height: 100 };
</script>

<ConnectDialog />
<Grid {itemSize} collision="compress" readOnly={$edit_locked} bind:controller={gridController}>
	{#each $component_store as item (item.id)}
		<div transition:fade={{ duration: 300 }}>
			<GridItem id={item.id} bind:x={item.x} bind:y={item.y} bind:w={item.w} bind:h={item.h}>
				<Card
					title={item.component_type}
					id={item.id}
					on:close={(event) => component_store.remove(event.detail)}
				>
					<svelte:component this={item.component} bind:props={item.props} />
				</Card>
			</GridItem>
		</div>
	{/each}
</Grid>
