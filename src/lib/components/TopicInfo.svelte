<script lang="ts">
    import { type Topic } from "$lib/stores/topics_tree.svelte";

    let {
        topic,
    } = $props<{topic: Topic}>();
</script>

<div>{topic.topic}</div>
<div>{topic.payload}</div>
<div>
{#each topic.sub_topics() as sub_topics }
    <div>{sub_topics.topic}</div>
{/each}
</div>