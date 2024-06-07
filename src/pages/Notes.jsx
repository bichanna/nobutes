import { invoke } from '@tauri-apps/api/tauri';
import { For, createSignal, createEffect } from 'solid-js';
import { Converter } from 'showdown'
import { A } from '@solidjs/router';

function Notes() {
  const converter = new Converter();

  const [notes, setNotes] = createSignal({});
  
  createEffect(() => {
    invoke('get_notes')
      .then((notes) => setNotes(notes))
      .catch((err) => {});
  });

  const maxNoteLength = 10;

  function truncateNoteBody(body) {
    const mdBody = converter.makeHtml(body);
    const splitted = mdBody.split(' ');
    const words = splitted.slice(0, maxNoteLength <= splitted.length ? maxNoteLength : splitted.length);
    
    if (words.length != splitted.length) {
      words.push('...');
    }
    
    return words.join(' ');
  }

  return <div class="m-5 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
    <For each={notes()}>
      {(note, _) => (
        <A href={"/note/" + note.id} class="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
          <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{note.title}</h5>
          <p class="font-normal text-gray-700 dark:text-gray-400" innerHTML={truncateNoteBody(note.body)}></p>
        </A>
      )}
    </For>
  </div>;
}

export default Notes;
