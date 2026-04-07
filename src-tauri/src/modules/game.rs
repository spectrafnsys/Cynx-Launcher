use std::ffi::{CString, OsStr, OsString};
use std::mem::zeroed;
use std::os::windows::process::CommandExt;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use tauri::Emitter;
use winapi::shared::windef::HWND;
use winapi::um::processthreadsapi::GetProcessId;
use winapi::um::shellapi::{ShellExecuteExA, SEE_MASK_NOCLOSEPROCESS, SHELLEXECUTEINFOA};
use winapi::um::{handleapi::CloseHandle, winbase::CREATE_SUSPENDED, winuser::SW_SHOW};

use crate::utilities;

const CREATE_NO_WINDOW: u32 = 0x08000000;

#[tauri::command]
pub fn launch_game(
    window: tauri::Window,
    file_path: String,
    exchange_code: String,
    version: String,
    is_local: bool,
) -> Result<bool, String> {
    let _ = utilities::kill_all_procs();

    let game_path = PathBuf::from(&file_path);
    let game_game_directory: &Path = game_path
        .parent()
        .expect("Failed to get parent directory")
        .parent()
        .expect("Failed to get FortniteGame directory");

    let game_dll_path = utilities::handle_game_dll_path(game_game_directory);

    if game_dll_path.exists() {
        if let Err(err) = utilities::remove_game_dll_sync(game_game_directory) {
            return Err(format!("Failed to remove game DLL: {}", err));
        }
    }

    let dll_url = "https://github.com/CynxDEV-OGFN/axys/raw/refs/heads/main/Arsenic.dll";
    if let Err(err) = utilities::download_file(dll_url, &game_dll_path) {
        return Err(format!("Failed to download game DLL: {}", err));
    }

    let cwd = game_game_directory.join("Win64");

    let fn_launcher = cwd.join("FortniteLauncher.exe");
    let fn_shipping = cwd.join("FortniteClient-Win64-Shipping.exe");
    let eac = cwd.join("FortniteClient-Win64-Shipping_BE.exe");

    if !game_dll_path.exists() {
        return Err("Failed to find Redirect (game DLL)".to_string());
    }

    let backend = "185.206.149.110:8080";

    let b_arg = &format!("-backend={}", backend);
    let exchange_arg = format!("-AUTH_PASSWORD={}", exchange_code);
    let combined_args = vec![
        "-epicapp=Fortnite",
        "-epicenv=Prod",
        "-epiclocale=en-us",
        "-epicportal",
        "-nobe",
        "-fromfl=eac",
        "-nocodeguards",
        "-nouac",
        "-fltoken=3db3ba5dcbd2e16703f3978d",
        "-caldera=eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X2lkIjoiYmU5ZGE1YzJmYmVhNDQwN2IyZjQwZWJhYWQ4NTlhZDQiLCJnZW5lcmF0ZWQiOjE2Mzg3MTcyNzgsImNhbGRlcmFHdWlkIjoiMzgxMGI4NjMtMmE2NS00NDU3LTliNTgtNGRhYjNiNDgyYTg2IiwiYWNQcm92aWRlciI6IkVhc3lBbnRpQ2hlYXQiLCJub3RlcyI6IiIsImZhbGxiYWNrIjpmYWxzZX0.VAWQB67RTxhiWOxx7DBjnzDnXyyEnX7OljJm-j2d88G_WgwQ9wrE6lwMEHZHjBd1ISJdUO1UVUqkfLdU5nofBQs",
        "-skippatchcheck",
        "-AUTH_LOGIN=",
        &exchange_arg,
        &b_arg,
        "-AUTH_TYPE=exchangecode",
        "-useallavailablecores",
        "-steamimportavailable"
    ];
    let combined_args_os: Vec<OsString> = combined_args
        .iter()
        .map(|&arg| OsString::from(arg))
        .collect();

    let combined_args_str: String = combined_args_os
        .iter()
        .map(|s| s.to_string_lossy())
        .collect::<Vec<_>>()
        .join(" ");

    let hwnd: HWND = std::ptr::null_mut();

    let exe_str = fn_shipping.to_str().ok_or("Invalid path to executable")?;
    let exe_cstring = CString::new(exe_str).map_err(|e| format!("CString error: {}", e))?;

    let args_cstring =
        CString::new(combined_args_str).map_err(|e| format!("CString error: {}", e))?;

    let lp_file = exe_cstring;
    let lp_params = args_cstring;
    let lp_verb = CString::new("runas").unwrap();

    let mut sei: SHELLEXECUTEINFOA = unsafe { zeroed() };
    sei.cbSize = std::mem::size_of::<SHELLEXECUTEINFOA>() as u32;
    sei.fMask = SEE_MASK_NOCLOSEPROCESS;
    sei.hwnd = hwnd;
    sei.lpVerb = lp_verb.as_ptr();
    sei.lpFile = lp_file.as_ptr();
    sei.lpParameters = lp_params.as_ptr();
    sei.nShow = SW_SHOW;

    let success = unsafe { ShellExecuteExA(&mut sei) };
    if success == 0 {
        return Err("ShellExecuteExA failed".to_string());
    }

    if sei.hProcess.is_null() {
        return Err("Failed to get process handle".to_string());
    }

    let _pid = unsafe { GetProcessId(sei.hProcess) };
    unsafe { CloseHandle(sei.hProcess) };

    std::thread::sleep(std::time::Duration::from_secs(5));

    let _eac_proc = Command::new(&eac)
        .creation_flags(CREATE_NO_WINDOW | CREATE_SUSPENDED)
        .args(
            combined_args_os
                .iter()
                .map(|arg| arg as &OsStr)
                .collect::<Vec<&OsStr>>(),
        )
        .stdout(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start EAC: {}", e));

    let _launcher_proc = Command::new(&fn_launcher)
        .creation_flags(CREATE_NO_WINDOW | CREATE_SUSPENDED)
        .args(
            combined_args_os
                .iter()
                .map(|arg| arg as &OsStr)
                .collect::<Vec<&OsStr>>(),
        )
        .stdout(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start Launcher: {}", e));

    std::thread::sleep(std::time::Duration::from_secs(5));

    Ok(true)
}

#[tauri::command]
pub fn close_game() -> Result<(), String> {
    let _ = utilities::kill_all_procs();
    Ok(())
}
