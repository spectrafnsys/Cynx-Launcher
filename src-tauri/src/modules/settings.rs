use tauri::Window;

#[tauri::command]
pub fn set_always_on_top(window: Window, always_on_top: bool) {
    let _ = window.set_always_on_top(always_on_top);
}
