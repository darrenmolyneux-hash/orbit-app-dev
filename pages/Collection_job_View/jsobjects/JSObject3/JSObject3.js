{{
  (function() {
    storeValue('newStatus', [wf_status_changer_widget].model.next_status).then(() => {
      qry_collection_status_update.run(
        function() {
          qry_collection_get.run(() => {
            qry_status_transitions.run();
          });
          showAlert('Status updated to ' + [wf_status_changer_widget].model.next_status, 'success');
        },
        function(error) {
          showAlert('Failed to update status — ' + error.message, 'error');
        }
      );
    });
  })()
}}