import { LocalStore } from './localstore';
import { type ComponentType } from 'svelte';
import { type GridController } from 'svelte-grid-extended';

export enum DashboardComponentType {
	TopicsTree = 'Topics',
	Publish = 'Publish',
	TopicMessages = 'TopicMessages',
	TopicMessagesGraph = 'TopicMessagesGraph',
}

export type Component = {
	id: any;
	component?: ComponentType;
	component_type: DashboardComponentType;
	props: any;
	x: number;
	y: number;
	w: number;
	h: number;
};

interface Event {
	detail: string;
}

const default_layout = [
	{
		id: crypto.randomUUID(),
		component_type: DashboardComponentType.TopicsTree,
		props: { filter: null },
		x: 0,
		y: 0,
		w: 4,
		h: 5
	},
	{
		id: crypto.randomUUID(),
		component_type: DashboardComponentType.Publish,
		props: {},
		x: 4,
		y: 0,
		w: 4,
		h: 5
	}
];

class ComponentsStore extends LocalStore<Component[]> {
	gridController: GridController | null = null;

	constructor(init: Component[]) {
		super('components', init);
	}

	add_new(component_type: DashboardComponentType, w: number, h: number, props: any) {
		if (!this.gridController) {
			console.log('gridController not ready');
			return;
		}
		const newPosition = this.gridController.getFirstAvailablePosition(w, h);
		let current = super.get();
		super.set([
			...current,
			{
				id: crypto.randomUUID(),
				component_type: component_type,
				props: props,
				x: newPosition?.x || 0,
				y: newPosition?.y || 0,
				w,
				h
			}
		]);
	}

	remove(id: FunctionStringCallback) {
		let current = super.get();
		current = current.filter((i) => i.id !== id);
		super.set(current);
	}
}

export const component_store = new ComponentsStore(default_layout);
