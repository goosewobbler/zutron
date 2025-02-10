#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod tray;

use tauri::Manager;
use zuri::handle_invoke;
use std::sync::Mutex;

// App-specific state
pub struct AppState {
    counter: Mutex<i32>,
}

impl AppState {
    fn handle_action(&self, action_type: &str) {
        match action_type {
            "COUNTER:INCREMENT" => {
                let mut counter = self.counter.lock().unwrap();
                *counter += 1;
            }
            "COUNTER:DECREMENT" => {
                let mut counter = self.counter.lock().unwrap();
                *counter -= 1;
            }
            _ => {}
        }
    }

    fn get_state(&self) -> serde_json::Value {
        let counter = *self.counter.lock().unwrap();
        serde_json::json!({ "counter": counter })
    }
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            counter: Mutex::new(0),
        }
    }
}

fn main() {
    let system_tray = tray::create_tray();

    tauri::Builder::default()
        .manage(AppState::default())
        .setup(|app| {
            let app_handle = app.handle();

            // Handle state requests
            {
                let app_handle = app_handle.clone();
                app.listen_global("zuri:get-state-request", move |_| {
                    let state = app_handle.state::<AppState>();
                    let current_state = state.get_state();
                    app_handle.emit_all("zuri:state-update", current_state).unwrap();
                });
            }

            // Handle actions
            {
                let app_handle = app_handle.clone();
                app.listen_global("zuri:action", move |event| {
                    if let Some(payload) = event.payload() {
                        if let Ok(value) = serde_json::from_str::<serde_json::Value>(payload) {
                            if let Some(action_type) = value.get("type").and_then(|v| v.as_str()) {
                                let state = app_handle.state::<AppState>();
                                state.handle_action(action_type);
                                app_handle.emit_all("zuri:state-update", state.get_state()).unwrap();
                            }
                        }
                    }
                });
            }
            Ok(())
        })
        .system_tray(system_tray)
        .on_system_tray_event(tray::handle_tray_event)
        .invoke_handler(|invoke| {
            handle_invoke(&invoke.message.window().app_handle(), invoke.message, invoke.resolver);
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
