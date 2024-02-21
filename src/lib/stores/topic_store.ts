import dayjs, { Dayjs } from 'dayjs';
import { RingBuffer } from 'ring-buffer-ts';

export class Message {
	id: string;
	time: Dayjs;
	topic: string;
	payload: Payload;

	constructor(topic: string, payload: Payload) {
		this.id = crypto.randomUUID();
		this.time = dayjs();
		this.topic = topic;
		this.payload = payload;
	}
}

import { writable, type Writable, type Subscriber } from 'svelte/store';
import { listen } from '@tauri-apps/api/event';

export type Payload = string | number;

export const mqtt_messages = listen<any>('message', (event) => {
	if (event.event !== 'message') {
		return;
	}
	event.payload.forEach(message => {
		topic_store.add(message.topic, message.payload);
	});
});

export class Topic {
	id: string;
	topic?: string;
	sub_topics: Writable<Topic[]> = writable([]);
	payload?: Payload;
	message_counter: Writable<number> = writable(0);
	message_buffer = new RingBuffer<Message>(1000);

	constructor(topic?: string, root?: Topic) {
		this.id = crypto.randomUUID();
		this.topic = topic;
		if (root) this.sub_topics = root.sub_topics;
	}

	add(topic: string, payload: Payload) {
		let [t, ...remaining_topic_path] = topic.split('/');
		this.message_counter.update((old) => old+1);
		if (topic != '') {
			this.sub_topics.update((sub_topics) => {
				let topic_index = sub_topics.findIndex((st) => st.topic == t);
				let sub_topic_path = remaining_topic_path.join('/');
				let sub_topic;
				if (topic_index < 0) {
					sub_topic = new Topic(t);
					sub_topic.add(sub_topic_path, payload);
					sub_topics.push(sub_topic);
					sub_topics.sort((a,b) => (a.topic || "") > (b.topic || "") ? 1 : -1);
				} else if (remaining_topic_path.length > 0) {
					sub_topic = sub_topics[topic_index];
					sub_topic.add(sub_topic_path, payload);
					sub_topics[topic_index] = sub_topic;
				}
				return sub_topics;
			});
		} else {
			this.payload = payload;
			this.message_buffer.add(new Message(topic, payload));
		}
	}

	set(value: Topic[]) {
		return this.sub_topics.set(value);
	}

	subscribe(run: Subscriber<Topic[]>) {
		return this.sub_topics.subscribe(run);
	}
}

export const topic_store = new Topic();
