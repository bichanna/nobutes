use rusqlite::Connection;
use serde::Serialize;
use tauri::AppHandle;

use std::fs;

const CURRENT_DB_VERSION: u32 = 1;

#[derive(Serialize)]
pub struct Note {
    id: usize,
    title: String,
    body: String,
}

pub fn initialize_database(handle: &AppHandle) -> Result<Connection, rusqlite::Error> {
    let app_dir = handle
        .path_resolver()
        .app_data_dir()
        .expect("The app directory should exist.");
    fs::create_dir_all(&app_dir).expect("The app directory must be created.");
    let sqlite_path = app_dir.join("Nobutes.sqlite");

    let mut conn = Connection::open(sqlite_path)?;

    let mut user_pragma = conn.prepare("PRAGMA user_version")?;
    let existing_user_version: u32 = user_pragma.query_row([], |row| Ok(row.get(0)?))?;
    drop(user_pragma);

    upgrade_database_if_needed(&mut conn, existing_user_version)?;

    Ok(conn)
}

fn upgrade_database_if_needed(
    conn: &mut Connection,
    existing_version: u32,
) -> Result<(), rusqlite::Error> {
    if existing_version < CURRENT_DB_VERSION {
        conn.pragma_update(None, "journal_mode", "WAL")?;

        let tx = conn.transaction()?;
        tx.pragma_update(None, "user_version", CURRENT_DB_VERSION)?;

        tx.execute_batch(
            "
            CREATE TABLE notes (
                id    INTEGER PRIMARY KEY,
                title TEXT NOT NULL,
                body  TEXT NOT NULL
            );
            ",
        )?;

        tx.commit()?;
    }

    Ok(())
}

pub fn add_note(conn: &Connection, title: &str, body: &str) -> Result<usize, rusqlite::Error> {
    conn.execute(
        "INSERT INTO notes (title, body) VALUES (?1, ?2)",
        (title, body),
    )?;

    conn.prepare("SELECT last_insert_rowid()")?
        .query_row([], |row| Ok(row.get(0)?))
}

pub fn modify_note(
    conn: &Connection,
    id: usize,
    title: &str,
    body: &str,
) -> Result<usize, rusqlite::Error> {
    conn.execute(
        "UPDATE notes SET title = ?1, body = ?2 WHERE id = ?3",
        (title, body, id),
    )?;
    Ok(id)
}

pub fn get_note(conn: &Connection, id: usize) -> Result<Note, rusqlite::Error> {
    let mut stmt = conn.prepare("SELECT id, title, body FROM notes WHERE id = ?1")?;
    stmt.query_row((id,), |row| {
        Ok(Note {
            id: row.get(0)?,
            title: row.get(1)?,
            body: row.get(2)?,
        })
    })
}

pub fn get_notes(conn: &Connection) -> Result<Vec<Note>, rusqlite::Error> {
    let mut stmt = conn.prepare("SELECT id, title, body FROM notes")?;
    let notes = stmt.query_map([], |row| {
        Ok(Note {
            id: row.get(0)?,
            title: row.get(1)?,
            body: row.get(2)?,
        })
    })?;

    notes.into_iter().collect()
}

pub fn delete_note(conn: &Connection, id: usize) -> Result<(), rusqlite::Error> {
    conn.execute("DELETE FROM notes WHERE id = ?1", (id,))?;
    Ok(())
}
