<script lang="ts">
	import { onMount } from 'svelte';
	import { Operator, type Stack, type Expression } from './functions/stack';
	export let stack: Stack;
	let op: Expression;
	let a: Expression;
	let b: Expression;

	onMount(() => {
		let stack_clone: Stack = Object.assign([], stack);
		op = stack_clone.shift() as Expression;
		if (op == Operator.Mul) {
			a = stack_clone.shift() as Expression;
			b = stack_clone.shift() as Expression;
		}
		if (op == Operator.Add) {
			a = stack_clone.shift() as Expression;
			b = stack_clone.shift() as Expression;
		}
	});
</script>

{#if op == Operator.Mul}
	<div>Mul</div>
{:else if op == Operator.Add}
	<div><svelte:self stack={a} />+<svelte:self stack={b} /></div>
{:else}
	{op}
{/if}
