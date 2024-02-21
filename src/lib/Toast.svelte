<script lang="ts">
	import { Alert } from '@svelteuidev/core';
	import { CrossCircled, CheckCircled, ExclamationTriangle, InfoCircled } from 'radix-icons-svelte';

	export let type = 'error';
	export let dismissible = true;
</script>

{#if type === 'success'}
	<Alert icon={CheckCircled} title={type} color="green" withCloseButton={!dismissible}>
		<slot />
	</Alert>
{:else if type === 'error'}
	<Alert icon={CrossCircled} title={type} color="red" withCloseButton={!dismissible}>
		<slot />
	</Alert>
{:else if type === 'warning'}
	<Alert icon={ExclamationTriangle} title={type} withCloseButton={!dismissible}>
		<slot />
	</Alert>
{:else}
	<Alert icon={InfoCircled} title={type} color="blue" withCloseButton={!dismissible}>
		<slot />
	</Alert>
{/if}
