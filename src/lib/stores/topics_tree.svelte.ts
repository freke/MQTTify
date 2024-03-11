type Payload = string | number

export class Topic {
	id: string
	topic: string
	private _sub_topics: Topic[] = $state([])
	payload?: Payload = $state(undefined)
	private _message_counter: number = $state(0)
	open: boolean = $state(false)
	// message_buffer = new RingBuffer<Message>(1000);

	constructor(topic: string) {
		this.id = crypto.randomUUID()
		this.topic = topic
	}

	add([topic, ...remaining_topic_path]: string[], payload: Payload) {
		if (topic !== this.topic) {
			return
		}
		this._message_counter += 1
		if (remaining_topic_path.length <= 0) {
			this.payload = payload
			return
		}
		let sub_topic
		const topic_index = this._sub_topics.findIndex((st) => st.topic == remaining_topic_path[0])
		if (topic_index < 0) {
			sub_topic = new Topic(remaining_topic_path[0])
			this._sub_topics.push(sub_topic)
			//this._sub_topics.sort((a, b) => ((a.topic || '') > (b.topic || '') ? 1 : -1))
		} else {
			sub_topic = this._sub_topics[topic_index]
		}
		sub_topic.add(remaining_topic_path, payload)
	}

	sub_topics() {
		return this._sub_topics
	}

	message_counter() {
		return this._message_counter
	}
}
