use std::fmt::{Display, Formatter};

use declarative_discord_rich_presence::{
    activity::{Activity, Assets, Button, Timestamps},
    DeclarativeDiscordIpcClient,
};

#[derive(Debug)]
enum RichPresenceError {
    ClientCreationError(String),
    EnableError(String),
    SetActivityError(String),
}

impl Display for RichPresenceError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match self {
            RichPresenceError::ClientCreationError(msg) => {
                write!(f, "Client creation failed: {}", msg)
            }
            RichPresenceError::EnableError(msg) => write!(f, "Client enable failed: {}", msg),
            RichPresenceError::SetActivityError(msg) => {
                write!(f, "Setting activity failed: {}", msg)
            }
        }
    }
}

impl std::error::Error for RichPresenceError {}

#[tauri::command]
pub fn start_rich_presence(username: String, character: String) {
    let client = DeclarativeDiscordIpcClient::new("1351896992288215060");
    client.enable();

    let details = format!("Logged in as {}", username);

    let buttons = vec![Button::new(
        String::from("Join Discord"),
        String::from("https://discord.gg/SF25AzukQj"),
    )];

    let timestamp = Timestamps::new();

    let assets = Assets::new()
        .large_image("large")
        .large_text("Pulse")
        .small_image(&character);

    let _ = client
        .set_activity(
            Activity::new()
                .details(&details)
                .buttons(buttons)
                .timestamps(timestamp)
                .assets(assets),
        )
        .map_err(|e| RichPresenceError::SetActivityError(e.to_string()));
}
