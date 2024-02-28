<script lang="ts">
    import { type ConnectionOptions } from '$lib/stores/connections.svelte';

    let {
        connection,
        onselect
    } = $props<{connection: ConnectionOptions, onselect: (e: string) => void}>();

    function select() {
        onselect(connection.id);
    }

</script>

<button onclick={select}>
	<div>{connection.name}</div>
	<div>{connection.protocol}{connection.host}:{connection.port}</div>
</button>
