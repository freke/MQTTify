<script lang="ts">
    import { type Connection } from '$lib/stores/connections.svelte';

    let {
        connection,
        onselect
    } = $props<{connection: Connection, onselect: (e: string) => void}>();

    function select() {
        onselect(connection.id);
    }

</script>

<button onclick={select}>
	<div>{connection.name}</div>
	<div>{connection.protocol}{connection.host}:{connection.port}</div>
</button>
