export default {
  getSel1: () => { try { return Number(Custom_Grading.model.selections[1]) || null; } catch(e) { return null; } },
  getSel2: () => { try { return Number(Custom_Grading.model.selections[2]) || null; } catch(e) { return null; } },
  getSel3: () => { try { return Number(Custom_Grading.model.selections[3]) || null; } catch(e) { return null; } },
  getSel4: () => { try { return Number(Custom_Grading.model.selections[4]) || null; } catch(e) { return null; } },
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