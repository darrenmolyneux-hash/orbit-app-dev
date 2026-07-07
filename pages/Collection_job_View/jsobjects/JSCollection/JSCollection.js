export default {
  async init() {
    await qry_collection_get.run();
    await qry_collection_summary.run();
    await qry_collection_notes_get.run();
    storeValue('collection_summary', qry_collection_summary.data[0]);
  },

  onOpenNotes: async () => {
    await qry_collection_notes_get.run();
    showModal('Notes_Modal');
  },

  onAddNote: async () => {
    const noteText = NotesModalWidget.model.noteText;
    if (!noteText || !noteText.trim()) {
      showAlert('Please enter a note.', 'warning');
      return;
    }
    await storeValue('noteText', noteText);
    try {
      await qry_collection_note_insert.run();
      await qry_collection_notes_get.run();
      showAlert('Note added ✓', 'success');
      closeModal('Notes_Modal');
    } catch (err) {
      showAlert('Failed to add note: ' + err.message, 'error');
    }
  }
}