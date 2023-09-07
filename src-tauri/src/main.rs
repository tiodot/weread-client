// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::api::ipc::{format_callback, format_callback_result, CallbackFn};
use tauri::{Window, InvokeResponse, Runtime};
use tauri::Manager;

fn window_invoke_responder<R: Runtime>(
    window: Window<R>,
    response: InvokeResponse,
    success_callback: CallbackFn,
    error_callback: CallbackFn,
  ) {
    let callback_string =
      match format_callback_result(response.into_result(), success_callback, error_callback) {
        Ok(callback_string) => callback_string,
        Err(e) => format_callback(error_callback, &e.to_string())
          .expect("unable to serialize response string to json"),
      };
  
    let _ = window.eval(&callback_string);
  }

fn get_style(content: &str) -> String {
    format!("__tauri_inject_style(`{}`)", content)
}


fn scripts() -> String {
  let mut is_dev = "false";
  #[cfg(dev)]
  {
    is_dev = "true";
  }
  format!("window.__tauri_dev__={};{};{};{};{};{}", 
    is_dev,
    include_str!("../inject/base.js"),
    get_style(include_str!("../inject/style.css")),
    include_str!("../inject/event.js"),
    include_str!("../inject/countdown.js"),
    include_str!("../inject/shelf.js")
  )
}

fn main() {
    let script = scripts();
    tauri::Builder::default() 
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_window_state::Builder::default().build()) 
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_system(script.to_string(), window_invoke_responder)
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