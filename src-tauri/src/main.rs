// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn get_style(content: &str) -> String {
    format!("__tauri_inject_style(`{}`)", content)
}


fn scripts() -> String {
   format!("{};{};{}", include_str!("../inject/base.js"), get_style(include_str!("../inject/style.css")), include_str!("../inject/event.js"))
}

fn main() {
    let script = scripts();
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::default().build()) 
        .invoke_system(script.to_string(), |_window,_res,_success,_error|{})
        // .invoke_system(include_str!("../inject/event.js").to_string(), |_window,_res,_success,_error|{})
        .on_window_event(|event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event.event() {
                #[cfg(target_os = "macos")]
                {
                    event.window().minimize().unwrap();
                }

                #[cfg(not(target_os = "macos"))]
                event.window().close().unwrap();

                api.prevent_close();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
