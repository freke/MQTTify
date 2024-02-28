<script lang="ts">
	import { QoS, type Subscription } from "$lib/stores/connections.svelte";

    let {
        subscription,
        ondelete
    } = $props<{subscription: Subscription, ondelete: (subscription: Subscription) => void }>();
</script>

<tr>
    <td>
        <button onclick={ () => ondelete(subscription) }>Delete</button>
    </td>
    <td>
        {subscription.topic}
    </td>
    <td>{QoS[subscription.qos]}
    </td>
</tr>