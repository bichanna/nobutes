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

  const [isModalOpen, setIsModalOpen] = createSignal(false);
  const [selectedNote, setSelectedNote] = createSignal({});

  function openModal(event) {
    event.preventDefault();
    setIsModalOpen(true);
  }

  function handleConfirm() {
    invoke('delete_note', { id: selectedNote().id }).then(() => {
      setIsModalOpen(false);
      // Remove that one note.
      setNotes(notes().filter((note) => note.id != selectedNote().id));
    });
  }

  return <>
    <div class="m-5">
      <h1 class="mb-3 text-4xl font-extrabold">No(bu)tes</h1>
      
      <div class="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        <A
          href={"/new"}
          class="items-center block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          <div class="content-center relative w-12 h-12">
            <svg class="w-full h-full text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
        </A>
        <For each={notes()}>
          {(note, _) => (
            <A
              onContextMenu={(event) => { openModal(event); setSelectedNote(note); }}
              href={"/note/" + note.id}
              class="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
            >
              <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{note.title}</h5>
              <p class="font-normal text-gray-700 dark:text-gray-400" innerHTML={truncateNoteBody(note.body)}></p>
            </A>
          )}
        </For>
      </div>

      <div
          class={`fixed z-10 inset-0 overflow-y-auto ${
            isModalOpen() ? 'block' : 'hidden'
          }`}
      >
        <div class="flex items-center justify-center min-h-screen">
          {/* Modal content */}
          <div class="bg-white rounded-lg shadow-lg p-6">
            <h2 class="text-lg font-bold mb-4">Remove "{selectedNote().title}"?</h2>
            <div class="flex justify-end">
              <button
                class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2"
                onClick={handleConfirm}
              >
                Confirm
              </button>
              <button
                class="bg-gray-400 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>;
}

export default Notes;
