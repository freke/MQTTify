<script lang="ts">
	import NewConnection from '$lib/components/NewConnection.svelte'
	import TopicsTree from '$lib/components/TopicsTree.svelte'
	import {
		ConnecitonStatus,
		ConnectionHealth,
		connection_status,
	} from '$lib/stores/connection.svelte'
	import type { ConnectionOptions } from '$lib/stores/connections.svelte'
	import { invoke } from '@tauri-apps/api/tauri'
	import { listen } from '@tauri-apps/api/event'
	import { Topic } from '$lib/stores/topics_tree.svelte'
	import TopicInfo from '$lib/components/TopicInfo.svelte'
	import Publish from '$lib/components/Publish.svelte'

	let current_connection = connection_status()
	let timer: ReturnType<typeof setTimeout>
	let error_msg = $state()
	let topic_root = $state(new Topic(''))
	let selected_topic = $state<Topic>()

	async function connect(connection_options: ConnectionOptions) {
		current_connection.connection_options = connection_options
		current_connection.connection_status = ConnecitonStatus.CONNECTING
		topic_root = new Topic(current_connection.connection_options.host)
		await invoke('connect', {
			name: current_connection.connection_options.client_id,
			host: current_connection.connection_options.host,
			port: current_connection.connection_options.port,
			username: current_connection.connection_options.username,
			password: current_connection.connection_options.password,
			validate: current_connection.connection_options.validate,
			tls: current_connection.connection_options.tls,
		})
	}

	async function disconnect() {
		await invoke('disconnect', {})
	}

	function connected() {
		clearTimeout(timer)
		current_connection.connection_status = ConnecitonStatus.CONNECTED
		current_connection.connection_health = ConnectionHealth.OK
		let subscriptions = (current_connection.connection_options?.subscripptions || []).map((s) => {
			return { topic: s.topic, qos: s.qos }
		})
		console.log(subscriptions)
		invoke('subscribe', { subscriptions: subscriptions })

		if (
			current_connection.connection_options &&
			current_connection.connection_options.keepalive > 0
		) {
			timer = setTimeout(function () {
				current_connection.connection_health = ConnectionHealth.UNSTABLE
			}, 5000)
		}
	}

	function publish(topic: string, payload: string) {
		invoke('publish', {
			topic: topic,
			payload: payload,
		})
	}

	function got_ping() {
		clearTimeout(timer)
		current_connection.connection_health = ConnectionHealth.OK
		if (
			current_connection.connection_options &&
			current_connection.connection_options.keepalive > 0
		) {
			timer = setTimeout(function () {
				current_connection.connection_health = ConnectionHealth.UNSTABLE
			}, 5000)
		}
	}

	function disconnected() {
		clearTimeout(timer)
		selected_topic = undefined
		current_connection.connection_status = ConnecitonStatus.OFFLINE
		current_connection.connection_health = ConnectionHealth.OK
	}

	export const mqtt_connection = listen<any>('connection', (event) => {
		if (event.event !== 'connection') {
			return
		}
		if (event.payload === 'Connected') {
			connected()
			return
		}
		if (event.payload.Disconnected) {
			disconnected()
			if (event.payload.Disconnected.error) {
				error_msg = JSON.stringify(event.payload.Disconnected.error)
			}
			return
		}
		if (event.payload === 'Ping') {
			got_ping()
			return
		}
	})

	interface Message {
		topic: string
		payload: string
	}

	export const mqtt_messages = listen<Message[]>('message', (event) => {
		if (event.event !== 'message') {
			return
		}
		event.payload.forEach((message: Message) => {
			let subtopic = topic_root.topic + '/' + message.topic
			topic_root.add(subtopic.split('/'), message.payload)
		})
	})
</script>

{#if current_connection.connection_status == ConnecitonStatus.OFFLINE}
	<NewConnection onconnect={connect} />
{/if}

<div>{ConnecitonStatus[current_connection.connection_status]}</div>

{#if current_connection.connection_status == ConnecitonStatus.CONNECTED}
	<button onclick={disconnect}>Disconnect</button>
	<h2>Publish</h2>
	<Publish onpublish={publish} />
	{#if selected_topic}
		<h2>Topic</h2>
		<button onclick={() => (selected_topic = undefined)}>Close</button>
		<TopicInfo topic={selected_topic} />
	{/if}
	<h2>Topics</h2>
	<TopicsTree
		topic={topic_root}
		indent={0}
		onselecttopic={(topic: Topic) => { selected_topic = topic }}
	/>
{/if}

{#if error_msg}
	<div>{error_msg}</div>
{/if}
