use rumqttc::{AsyncClient, EventLoop, MqttOptions, Transport, TlsConfiguration};
use tokio::sync::mpsc;
use tracing::{debug, info, error};
use std::time::Duration;
use base64::prelude::*;

use crate::gui::{self, Disconnected, Error};

#[derive(Default)]
pub struct MqttConnection {
    pub client: Option<AsyncClient>,
}

#[derive(Default, Debug)]
pub struct Credentials {
    pub username: Option<String>,
    pub password: Option<String>
}

#[derive(Debug)]
pub struct Options {
    pub credentials : Credentials,
    pub validate_tls : bool,
    pub tls : bool
}

pub fn connect(name: String, host: String, port: u16, options: Options, async_proc_output_tx: mpsc::Sender<gui::Event>) -> AsyncClient {
    info!(?name, ?host, ?port, ?options, "Connecting...");
    let mut mqttoptions = MqttOptions::new(name, &host, port);
    //mqttoptions.set_keep_alive(Duration::from_secs(5));
    mqttoptions.set_keep_alive(Duration::from_secs(0));
    if options.credentials.username != None && options.credentials.password != None {
        info!("Logging in with username and password...");
        mqttoptions.set_credentials(options.credentials.username.unwrap(), options.credentials.password.unwrap());
    }
    if !options.validate_tls {

    }
    if options.tls {
        info!("Using TLS...");
        mqttoptions.set_transport(Transport::tls_with_default_config());
    }
    mqttoptions.set_max_packet_size(usize::MAX, usize::MAX);
    info!("{:?}", mqttoptions.keep_alive());
    info!("{:?}", mqttoptions.manual_acks());
    let (client, mut eventloop) = AsyncClient::new(mqttoptions, 10);
    eventloop.network_options.set_connection_timeout(15);

    tauri::async_runtime::spawn(async move {
        async_process_model(eventloop, async_proc_output_tx).await;
    });

    return client;
}

async fn async_process_model(
    mut eventloop: EventLoop,
    output_tx: mpsc::Sender<gui::Event>,
) {
    loop {
        let event = eventloop.poll().await;
        debug!(?event, "async_process_model");
        match event {
            Ok(rumqttc::Event::Outgoing(rumqttc::Outgoing::Disconnect)) => {
                let _ = output_tx.send(gui::Event::Disconnected(Disconnected{ error: Default::default() } )).await;
                break;
            }
            Ok(rumqttc::Event::Outgoing(rumqttc::Outgoing::PingReq)) => {info!("PingReq");}
            Ok(rumqttc::Event::Outgoing(rumqttc::Outgoing::PingResp)) => {info!("PingResp");}
            Ok(rumqttc::Event::Outgoing(outgoing)) => {
                info!(?outgoing, "unhandled outgoing event");
            }
            Ok(rumqttc::Event::Incoming(rumqttc::Packet::Publish(mqtt_message))) => {
                let payload_result = String::from_utf8(mqtt_message.payload.to_vec());
                match payload_result {
                    Ok(payload) => {
                        let _ = output_tx.send(gui::Event::Publish(gui::Message {topic: mqtt_message.topic, payload: payload})).await;
                    }
                    Err(_err) => {
                        let base64encoded = BASE64_STANDARD.encode(mqtt_message.payload);
                        let _ = output_tx.send(gui::Event::Publish(gui::Message {topic: mqtt_message.topic, payload: base64encoded})).await;
                    }
                }                
            }
            Ok(rumqttc::Event::Incoming(rumqttc::Incoming::ConnAck(ack))) => {
                if ack.code == rumqttc::ConnectReturnCode::Success {
                    info!("Successfully connected to mqtt broker");
                    let _ = output_tx.send(gui::Event::Connected).await;
                } else {
                    error!("Could not connect to mqtt broker: {:?}", ack.code);
                    let _ = output_tx.send(gui::Event::Error( Error { error: Some(format!("Could not connect to mqtt broker: {:?}", ack.code)) } )).await;
                    tokio::time::sleep(Duration::from_secs(5)).await;
                }
            }
            Ok(rumqttc::Event::Incoming(rumqttc::Packet::PingReq)) => {
                info!("Ping...");
                let _ = output_tx.send(gui::Event::Ping).await;
            }
            Ok(rumqttc::Event::Incoming(rumqttc::Packet::PingResp)) => {
                info!("Pong...");
                let _ = output_tx.send(gui::Event::Ping).await;
            }
            Ok(rumqttc::Event::Incoming(packet)) => {
                info!(?packet, "unhandled incomming packet");
            }
            Err(rumqttc::ConnectionError::ConnectionRefused(return_code)) => {
                info!(?return_code, "Connection refused");
                let _ = output_tx.send(gui::Event::Disconnected( Disconnected { error: Some(format!("Connection refused {:?}", return_code)) } )).await;
                break;
            }
            Err(rumqttc::ConnectionError::NetworkTimeout) => {
                info!("Network connection error, NetworkTimeout");
                let _ = output_tx.send(gui::Event::Disconnected( Disconnected { error: Some("Connection timeout".to_string()) } )).await;
                break;
            }
            Err(rumqttc::ConnectionError::Io(io)) => {
                info!(?io, "Server connection error");
                let _ = output_tx.send(gui::Event::Disconnected( Disconnected { error: Some(format!("{:?}", io.kind())) } )).await;
                break;
            }
            Err(rumqttc::ConnectionError::MqttState(state_err)) => {
                error!(?state_err, "State error");
                let _ = output_tx.send(gui::Event::Error( Error { error: Some(format!("{:?}", state_err)) } )).await;
                tokio::time::sleep(Duration::from_secs(5)).await;
            }
            Err(err) => {
                error!(?err, "unhandled error");
                let _ = output_tx.send(gui::Event::Error( Error { error: Some(format!("{:?}", err)) } )).await;
                tokio::time::sleep(Duration::from_secs(5)).await;
            }
        }
    }
}
