<script lang="ts">
	let { children } = $props()
</script>

<h1>MQTTify</h1>
{#if children}
	{@render children()}
{:else}
	<span>No content found</span>
{/if}
