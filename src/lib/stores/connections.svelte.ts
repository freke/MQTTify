import { unstate } from 'svelte';

export enum Protocols {
    MQTT = 'mqtt://'
}

export type Connection = {
    id: string,
    name: string,
    protocol: Protocols,
    host: string,
    port: number,
    username?: string,
    password?: string,
    subscripptions: Subscription[]
}

export enum QoS {
    AtMostOnce = 'AtMostOnce',
    AtLeastOnce = 'AtLeastOnce',
    ExactlyOnce = 'ExactlyOnce'
}

export type Subscription = {
    id: string,
    topic: string,
    qos: QoS
}

export function new_connection(name: string, protocol: Protocols, host: string, port: number): Connection {
    return {
        id: crypto.randomUUID(),
        name: name,
        protocol: protocol,
        host: host,
        port: port,
        subscripptions: [
            new_subscription("#", QoS.AtLeastOnce),
            new_subscription("$SYS/#", QoS.AtLeastOnce)
        ]
    };
}

export function new_subscription(topic: string, qos: QoS): Subscription {
    return { id: crypto.randomUUID(), topic: topic, qos: qos };
}

export function connection(initial: Connection) {
    let connection = $state({ connection: initial });
    return connection;
}

const key = 'connections';
if (localStorage.getItem(key) === null) {
    // item not present in local storage
    localStorage.setItem(key, 
        JSON.stringify(
            [
                new_connection("test.mosquitto.org",
                    Protocols.MQTT,
                    "test.mosquitto.org",
                    1883
                )
            ]
        )
    ); // initialize local storage with initial value
}
const connections_state: Connection[] = $state(JSON.parse(localStorage.getItem(key) || '[]'));

export function connections() {
    return {
        get connections() { return unstate(connections_state) },
        add: (connection: Connection) => {
            connections_state.push(unstate(connection));
            localStorage.setItem(key, JSON.stringify(connections_state, null, 2));
        },
        save: (connection: Connection) => {
            const i = connections_state.findIndex((obj) => obj.id === connection.id);
            if(i < 0) {
                connections_state.push(unstate(connection));
            } else {
                connections_state[i] = unstate(connection);
            }
            localStorage.setItem(key, JSON.stringify(connections_state, null, 2));
        },
        delete: (connection: Connection) => {
            connections_state.forEach((item, index) => {
                if (item.id === connection.id) connections_state.splice(index, 1);
            });
            localStorage.setItem(key, JSON.stringify(connections_state, null, 2));
        }
    }
}

export function subscriptions(connection: Connection) {
    return {
        get subscriptions() { return unstate(connection.subscripptions) },
        add: (subscription: Subscription) => {
            connection.subscripptions.push(unstate(subscription));
        },
        save: (subscription: Subscription) => {
            const i = connection.subscripptions.findIndex((obj) => obj.id === subscription.id);
            if(i < 0) {
                connection.subscripptions.push(unstate(subscription));
            } else {
                connection.subscripptions[i] = unstate(subscription);
            }
            localStorage.setItem(key, JSON.stringify(connection.subscripptions, null, 2));
        },
        delete: (subscription: Subscription) => {
            connection.subscripptions.forEach((item, index) => {
                if (item.id === subscription.id) connection.subscripptions.splice(index, 1);
            });
        }
    }
}