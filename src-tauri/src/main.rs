// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tracing_subscriber::{self};

mod gui;
mod mqtt;



#[derive(Debug, Clone, serde::Serialize)]
struct MqttConnectionError {
    error: String
}

#[derive(Debug, Clone, serde::Serialize)]
struct MqttMessage {
    topic: String,
    payload: String
}

#[derive(Debug, Clone, serde::Serialize)]
struct Connected {}


fn main() {
    tracing_subscriber::fmt::init();
    gui::create_gui();
}


