// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod database;
mod state;

use tauri::{AppHandle, Manager, State};

use crate::database::Note;
use crate::state::{AppState, ServiceAccess};

#[tauri::command]
fn add_note(handle: AppHandle, title: &str, body: &str) -> Result<Note, ()> {
    let note_id = handle.db(|conn| database::add_note(conn, title, body));
    if let Err(_) = note_id {
        return Err(());
    }

    let note_id = note_id.unwrap();

    let note = handle.db(|conn| database::get_note(conn, note_id));
    if let Err(_) = note {
        return Err(());
    }

    Ok(note.unwrap())
}

#[tauri::command]
fn modify_note(handle: AppHandle, id: usize, title: &str, body: &str) -> Result<Note, ()> {
    let note_id = handle.db(|conn| database::modify_note(conn, id, title, body));
    if let Err(_) = note_id {
        return Err(());
    }

    let note_id = note_id.unwrap();

    let note = handle.db(|conn| database::get_note(conn, note_id));
    if let Err(_) = note {
        return Err(());
    }

    Ok(note.unwrap())
}

#[tauri::command]
fn get_note(handle: AppHandle, id: usize) -> Result<Note, ()> {
    let note = handle.db(|conn| database::get_note(conn, id));
    if let Err(_) = note {
        return Err(());
    }

    Ok(note.unwrap())
}

#[tauri::command]
fn get_notes(handle: AppHandle) -> Result<Vec<Note>, ()> {
    let notes = handle.db(|conn| database::get_notes(conn));
    if let Err(_) = notes {
        return Err(());
    }

    Ok(notes.unwrap())
}

#[tauri::command]
fn delete_note(handle: AppHandle, id: usize) -> bool {
    handle.db(|conn| database::delete_note(conn, id)).is_ok()
}

fn main() {
    tauri::Builder::default()
        .manage(AppState {
            db: Default::default(),
        })
        .invoke_handler(tauri::generate_handler![
            add_note,
            modify_note,
            get_note,
            get_notes,
            delete_note
        ])
        .setup(|app| {
            let handle = app.handle();
            let app_state: State<AppState> = handle.state();
            let db =
                database::initialize_database(&handle).expect("Database initialization failed.");
            *app_state.db.lock().unwrap() = Some(db);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
