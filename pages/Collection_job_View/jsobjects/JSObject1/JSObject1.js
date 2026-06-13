{{
  (function() {
    storeValue('noteText', onAddNote.noteText);
    storeValue('noteType', onAddNote.noteType);
    qry_collection_note_insert.run(
      function() {
        qry_collection_notes_get.run();
      },
      function() {
        showAlert('Failed to add note', 'error');
      }
    );
  })()
}}