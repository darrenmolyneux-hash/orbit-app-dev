export default {
  getCategoryId: (name) => {
    try {
      const rows = Custom_Grading.model.gradingData || [];
      const row = rows.find(r => r.category_name === name && !r.is_checklist);
      return row ? row.category_id : null;
    } catch(e) { return null; }
  },
  getSel1: () => {
    try {
      const catId = GradingData.getCategoryId('Cosmetics');
      return catId ? (Number(Custom_Grading.model.selections[catId]) || null) : null;
    } catch(e) { return null; }
  },
  getSel2: () => {
    try {
      const catId = GradingData.getCategoryId('LCD') || GradingData.getCategoryId('Screen');
      return catId ? (Number(Custom_Grading.model.selections[catId]) || null) : null;
    } catch(e) { return null; }
  },
  getSel3: () => {
    try {
      const catId = GradingData.getCategoryId('Functionality');
      return catId ? (Number(Custom_Grading.model.selections[catId]) || null) : null;
    } catch(e) { return null; }
  },
  getSel4: () => {
    try {
      const catId = GradingData.getCategoryId('Missing Components');
      return catId ? (Number(Custom_Grading.model.selections[catId]) || null) : null;
    } catch(e) { return null; }
  },
  getBios: () => { try { return Custom_Grading.model.locks['BIOS Lock'] || false; } catch(e) { return false; } },
  getMdm: () => { try { return Custom_Grading.model.locks['MDM Lock'] || false; } catch(e) { return false; } },
  getEfi: () => { try { return Custom_Grading.model.locks['EFI Lock'] || false; } catch(e) { return false; } },
  getIcloud: () => { try { return Custom_Grading.model.locks['iCloud Lock'] || false; } catch(e) { return false; } },
  getIntune: () => { try { return Custom_Grading.model.locks['inTune'] || false; } catch(e) { return false; } },
  getNoHdd: () => { try { return Custom_Grading.model.noHdd || false; } catch(e) { return false; } },
  getNoRam: () => { try { return Custom_Grading.model.noRam || false; } catch(e) { return false; } },
  getGrade: () => { try { return Custom_Grading.model.overallGrade || ''; } catch(e) { return ''; } },
  getNotes: () => { try { return Custom_Grading.model.notes || ''; } catch(e) { return ''; } }
}