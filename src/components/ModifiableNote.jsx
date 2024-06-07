import { invoke } from '@tauri-apps/api/tauri';

function ModifiableNote(props) {
  function modifyNote() {
    const title = document.getElementById('noteTitle').value;
    const body = document.getElementById('noteBody').value;
    invoke('modify_note', {id: props.id, title: title, body: body})
      .catch((err) => {});
  }

  return <div class="h-screen">
    <div class="flex flex-col absolute inset-0 m-5">
      <button onclick="window.history.back()" class="bg-blue-500 hover:bg-blue-700 text-white w-20 font-bold py-2 px-4 rounded">
        Back
      </button>
      <input id="noteTitle" class="basis-1/12" value={props.title} />
      <textarea
        id="noteBody"
        value={props.body}
        placeholder="Write your thoughts here..."
        class="basis-10/12 rounded resize:none focus:shadow-soft-primary-outline min-h-unset text-sm leading-5.6 ease-soft block w-full appearance-none bg-white bg-clip-padding px-3 py-2 font-normal text-gray-700 outline-none transition-all placeholder:text-gray-500 focus:border-fuchsia-300 focus:outline-none">
      </textarea>
      <div class="basis-1/12 flex-row">
        <button
          class="mt-5 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md flex items-center"
          onClick={modifyNote}
        >
          <svg class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          Save
        </button>
      </div>
    </div>
  </div>;
}

export default ModifiableNote;
