<script lang="ts">
	import { type Topic } from "$lib/stores/topics_tree.svelte";

    let {
        topic,
        onselecttopic,
        indent = 0,
    } = $props<{topic: Topic, onselecttopic: (topic: Topic) => void, indent: number}>();

    function toggleOpen() {
		topic.open = !topic.open;
	}

    const max_payload_length = 30;
    let payload_disp = $derived.by(() => {
        if(!topic.payload)
            return "";
        let post_fix = "";
        if(topic.payload.toString().length > max_payload_length)
            post_fix = "..."
        return " = " + topic.payload.toString().substring(0,max_payload_length) + post_fix
    })

    let topic_disp = $derived.by(() => {
        let post_fix = "";
        if(topic.topic.length > max_payload_length)
            post_fix = "..."
        return topic.topic.substring(0,max_payload_length) + post_fix;
    })
</script>

<div style="padding-left: {indent}px">
{#if topic.sub_topics().length > 0}
    <button onclick={toggleOpen}>{ topic.open ? "open" : "closed" }</button>
{/if}
    <span>{topic_disp} (topics: {topic.sub_topics().length}, msg: {topic.message_counter()})  {payload_disp}</span>
{#if topic.payload}
    <button onclick={() => {onselecttopic(topic)}}>Info</button>
{/if}
{#if topic.open}
    {#each topic.sub_topics() as sub_topic }
        <svelte:self topic={sub_topic} onselecttopic={onselecttopic} indent={indent + 24}/>
    {/each}
{/if}
</div>