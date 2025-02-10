use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Manager, Runtime, InvokeMessage, InvokeResolver};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Action {
    #[serde(rename = "type")]
    pub action_type: String,
    pub payload: Option<serde_json::Value>,
}

pub fn handle_invoke<R: Runtime>(app: &AppHandle<R>, msg: InvokeMessage, resolver: InvokeResolver) {
    match msg.command() {
        "zuri:get-state" => {
            // Forward state request to app
            app.emit_all("zuri:get-state-request", ()).unwrap();
            resolver.resolve(());
        }
        "zuri:dispatch" => {
            let payload = msg.payload();
            if let Ok(action) = serde_json::from_value::<Action>(payload.clone()) {
                // Forward action to app
                app.emit_all("zuri:action", action).unwrap();
                resolver.resolve(());
            }
        }
        _ => {
            resolver.reject("Unknown command");
        }
    }
}
