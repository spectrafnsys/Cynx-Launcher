use reqwest;
use std::fs::File;
use std::io::Write;
use std::path::Path;
use tauri::{command, Emitter, Window};
use tokio::io::AsyncWriteExt;

#[tauri::command]
pub async fn download_pulse_file(
    window: Window,
    url: String,
    file_path: String,
) -> Result<(), String> {
    let client = reqwest::Client::new();

    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Failed to start download: {}", e))?;

    let total_size = response.content_length().unwrap_or(0);

    if let Some(parent) = Path::new(&file_path).parent() {
        std::fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    let mut file =
        std::fs::File::create(&file_path).map_err(|e| format!("Failed to create file: {}", e))?;

    let mut downloaded = 0u64;
    let mut stream = response.bytes_stream();

    use futures_util::StreamExt;

    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| format!("Failed to read chunk: {}", e))?;

        file.write_all(&chunk)
            .map_err(|e| format!("Failed to write chunk: {}", e))?;

        downloaded += chunk.len() as u64;

        let _ = window.emit(
            "download_progress",
            serde_json::json!({
                "url": url,
                "downloaded": downloaded,
                "total": total_size,
                "file_path": file_path
            }),
        );
    }

    file.flush()
        .map_err(|e| format!("Failed to flush file: {}", e))?;

    Ok(())
}
