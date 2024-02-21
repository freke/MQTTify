<script lang="ts">
	import {
		Flex,
		Box,
		ActionIcon,
		Title,
		Text,
		Space,
		Collapse,
		createStyles
	} from '@svelteuidev/core';
	import { CaretUp, CaretDown } from 'radix-icons-svelte';

	let open = true;

	const useStyles = createStyles((theme) => ({
		root: {
			[`${theme.dark} &`]: {
				bc: theme.colors['dark500'].value
			},
			backgroundColor: theme.fn.themeColor('gray', 1),
			padding: '$5',
			borderRadius: '$md'
		}
	}));

	function toggle() {
		open = !open;
	}
	$: ({ classes, getStyles } = useStyles());
</script>

<Box class={getStyles()}>
	<Flex justify="space-between" align="baseline" wrap="nowrap" gap="xs">
		<Title order={4}><slot name="title" /></Title>
		<ActionIcon on:click={toggle}>
			{#if open}
				<CaretUp size={16} />
			{:else}
				<CaretDown size={16} />
			{/if}
		</ActionIcon>
	</Flex>
	<Text size="xs" color="dimmed"><slot name="time" /></Text>
	<Space h="md" />
	<Collapse {open}>
		<Text><slot /></Text>
	</Collapse>
</Box>
