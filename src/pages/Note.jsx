import { useParams } from '@solidjs/router';
import { createSignal, createEffect } from 'solid-js';
import { invoke } from '@tauri-apps/api/tauri';

import ModifiableNote from '../components/ModifiableNote';

function Note() {
  const params = useParams();
  const noteId = parseInt(params.id, 10);
  
  const [note, setNote] = createSignal({});

  createEffect(() => {
    invoke('get_note', { id: noteId })
      .then((note) => setNote(note))
      .catch((err) => {})
  });

  return <ModifiableNote id={noteId} title={note().title} body={note().body} />
}

export default Note;
