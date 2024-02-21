<script lang="ts">
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import {
		SvelteUIProvider,
		colorScheme,
		AppShell,
		Title,
		Space,
		Header,
		Flex,
		Burger
	} from '@svelteuidev/core';
	import HeadContent from '../lib/HeadContent.svelte';
	import NavbarContent from '../lib/NavbarContent.svelte';

	import Toasts from '$lib/Toasts.svelte';

	let opened = false;

	function toggleOpened() {
		opened = !opened;
	}
</script>

<SvelteUIProvider withGlobalStyles themeObserver={$colorScheme}>
	<AppShell>
		{#if opened}
			<div
				class="sidebar {$colorScheme}"
				transition:slide={{ delay: 250, duration: 300, easing: quintOut, axis: 'x' }}
			>
				<Space h={60} />
				<NavbarContent />
			</div>
		{/if}
		<Header fixed slot="header" height="60px" override={{ 'z-index': 5 }}>
			<Flex wrap="nowrap" justify="space-between" align="center" override={{ margin: '10px' }}>
				<Flex>
					<Burger {opened} on:click={toggleOpened} />
					<Space w={40} />
					<Title order={1} override={{ 'padding-top': '5px' }}>MQTTify</Title>
				</Flex>
				<HeadContent />
			</Flex>
		</Header>
		<Space h={60} />
		<slot />
		<Toasts />
	</AppShell>
</SvelteUIProvider>

<style>
	.sidebar {
		position: absolute;
		height: 100vh;
		background-color: #e9ecef;
		left: 0;
		width: 300px;
		max-width: 100vw;
		box-shadow:
			0 1px 3px rgba(0, 0, 0, 0.05),
			0 1px 2px rgba(0, 0, 0, 0.1);
		z-index: 1;
	}
	.sidebar.dark {
		background-color: #343a40;
		box-shadow: -4px 0 15px rgb(0 0 0 / 50%);
	}
</style>
