use std::time::Duration;
use rumqttc::QoS;
use tauri::{Manager, Result};
use tokio::sync::{mpsc, Mutex};
use tracing::info;
use std::sync::Arc;
use serde::Deserialize;
use serde::Serialize;

use crate::mqtt;

mod buffer_trigger_async;

#[derive(Debug, Clone, serde::Serialize)]
pub struct Message {
    pub topic: String,
    pub payload: String,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct Disconnected {
    pub error: Option<String>
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct Error {
    pub error: Option<String>
}


#[derive(Debug, Clone, serde::Serialize)]
pub enum Event {
    Connected,
    Disconnected(Disconnected),
    Error(Error),
    Publish(Message),
    Ping,
}

#[derive(Default)]
struct State {
    client: Mutex<Option<mqtt::MqttConnection>>,
}

pub fn create_gui() {
    tauri::Builder::default()
        .manage(State {
            client: Default::default()
        })
        .invoke_handler(tauri::generate_handler![connect, disconnect, subscribe, unsubscribe, publish])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn send_mqtt_message<R: tauri::Runtime>(message: Vec<Message>, manager: &impl Manager<R>) {
    let _res = manager.emit_all("message", message);
}

fn rs2js<R: tauri::Runtime>(message: Event, manager: &impl Manager<R>) {
    let _res = match message {
        Event::Connected => manager.emit_all("connection", message),
        Event::Disconnected(_) => manager.emit_all("connection", message),
        Event::Ping => manager.emit_all("connection", message),
        Event::Publish(_) => {info!("{:?}", message); manager.emit_all("message", message)},
        Event::Error(_) => manager.emit_all("error", message),
    };
}

#[tauri::command]
async fn connect(
    app_handle: tauri::AppHandle,
    state: tauri::State<'_, State>,
    name: String,
    host: String,
    port: u16,
    username: Option<String>,
    password: Option<String>,
) -> Result<()> {
    info!("Connecting...");
    let (async_proc_output_tx, mut async_proc_output_rx): (
        mpsc::Sender<Event>,
        mpsc::Receiver<Event>,
    ) = mpsc::channel(1);
    let credentials = mqtt::Credentials { username, password };

    let options = mqtt::Options { credentials };
    let client = mqtt::connect(name, host, port, options, async_proc_output_tx);

    *state.client.lock().await = Some(mqtt::MqttConnection {
        client: Some(client),
    });

    tauri::async_runtime::spawn(async move {
        let h = Arc::new(app_handle.clone());
        let consumer = Box::new(move |message| {            
            send_mqtt_message(message, &*h);
        });
        // let consumer = Box::new(|message| info!("{:?}", message));
        let message_buffer: buffer_trigger_async::Simple<Message, Vec<Message>> =
            buffer_trigger_async::SimpleBuilder::builder(Vec::default)
                .name("message_buffer".to_owned())
                .accumulator(|c, e| c.push(e))
                .consumer(consumer)
                .max_len(1000)
                .interval(Duration::from_millis(300))
                .build();
    
        loop {
            if let Some(output) = async_proc_output_rx.recv().await {
                match output {
                    Event::Publish(message) => {
                        message_buffer.push(message).await;
                    },
                    _ => {
                        info!("{:?}", output);
                        rs2js(output, &app_handle);
                    },
                }
            }
        }
    });

    Ok(())
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Subscription {
    pub topic: String,
    pub qos: u8,
}

#[tauri::command]
async fn subscribe(state: tauri::State<'_, State>, subscriptions: Vec<Subscription>) -> Result<()> {
    info!("Subscribe...");
    let client = state.client.lock().await;
    match &client.as_ref().unwrap().client {
        Some(connection) => {
            for subscription in subscriptions {
                info!("subscribe {:?}", subscription);
                let qos = match subscription.qos {
                    0 => QoS::AtMostOnce,
                    1 => QoS::AtLeastOnce,
                    2 => QoS::ExactlyOnce,
                    _ => panic!("QoS is invalid")
                };
                connection.subscribe(subscription.topic, qos ).await.unwrap();
            }
        }
        None => {}
    }
    Ok(())
}

#[tauri::command]
async fn unsubscribe(state: tauri::State<'_, State>, topic: String) -> Result<()> {
    let client = state.client.lock().await;
    match &client.as_ref().unwrap().client {
        Some(connection) => {
            connection.unsubscribe(topic).await.unwrap();
        }
        None => {}
    }
    Ok(())
}

#[tauri::command]
async fn disconnect(state: tauri::State<'_, State>) -> Result<()> {
    let client = state.client.lock().await;
    match &client.as_ref().unwrap().client {
        Some(connection) => {
            let _ = connection.disconnect().await;
        }
        None => {}
    }
    Ok(())
}

#[tauri::command]
async fn publish(
    state: tauri::State<'_, State>,
    topic: String,
    payload: String,
) -> Result<()> {
    let client = state.client.lock().await;
    match &client.as_ref().unwrap().client {
        Some(connection) => {
            connection
                .publish(topic, QoS::AtLeastOnce, false, payload)
                .await
                .unwrap();
        }
        None => {}
    }
    Ok(())
}
