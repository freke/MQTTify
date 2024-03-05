<script lang="ts">
	let topic: string = $state('')
	let payload: string = $state('')

	let { onpublish } = $props<{ onpublish: (topic: string, payload: string) => void }>()

	function publish() {
		onpublish(topic, payload)
	}
</script>

<div>
	<label for="topic">Topic</label>
	<input id="topic" bind:value={topic} />
	<label for="payload">Payload</label>
	<textarea id="payload" bind:value={payload} />
	<button onclick={publish}>Send</button>
</div>
