use tauri::{
    AppHandle, CustomMenuItem, Manager, SystemTray, SystemTrayEvent,
    SystemTrayMenu, SystemTrayMenuItem
};
use serde_json::Value;
use serde_json::json;

pub fn create_tray() -> SystemTray {
    let increment = CustomMenuItem::new("increment".to_string(), "increment");
    let decrement = CustomMenuItem::new("decrement".to_string(), "decrement");
    let quit = CustomMenuItem::new("quit".to_string(), "quit");

    let tray_menu = SystemTrayMenu::new()
        .add_item(decrement)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(increment)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    SystemTray::new().with_menu(tray_menu)
}

pub fn handle_tray_event(app: &AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
            "increment" => {
                app.emit_all("zuri:action",
                    json!({
                        "type": "COUNTER:INCREMENT"
                    })
                ).unwrap();
            }
            "decrement" => {
                app.emit_all("zuri:action",
                    json!({
                        "type": "COUNTER:DECREMENT"
                    })
                ).unwrap();
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        },
        SystemTrayEvent::LeftClick { .. } => {
            let window = app.get_window("main").unwrap();
            window.show().unwrap();
        }
        _ => {}
    }
}

pub fn update_tray_title(app: &AppHandle, state: &Value) {
    if let Some(counter) = state.get("counter") {
        let counter_str = format!("state: {}", counter);
        let tray = app.tray_handle();
        tray.set_title(&counter_str).unwrap();

        // Update menu item label
        let menu_item = CustomMenuItem::new("state", &counter_str);
        let menu = SystemTrayMenu::new()
            .add_item(CustomMenuItem::new("decrement", "decrement"))
            .add_item(menu_item)
            .add_item(CustomMenuItem::new("increment", "increment"))
            .add_native_item(SystemTrayMenuItem::Separator)
            .add_item(CustomMenuItem::new("quit", "quit"));

        tray.set_menu(menu).unwrap();
    }
}
