// ==========================
//  db.js — IndexedDB / PouchDB
// ==========================
// Este archivo maneja la base de datos local para la PWA.
// Se utiliza PouchDB porque es más simple y compatible offline.

console.log("DB inicializada con PouchDB");

// Creamos la base de datos
const localDB = new PouchDB("kioskDB");

// Función para agregar o actualizar un documento
async function dbSave(doc) {
  try {
    const existing = await localDB.get(doc._id).catch(() => null);

    if (existing) {
      doc._rev = existing._rev;
    }

    const saved = await localDB.put(doc);
    return saved;
  } catch (err) {
    console.error("Error guardando documento", err);
  }
}

async function dbGetAll() {
  try {
    const result = await localDB.allDocs({ include_docs: true });
    return result.rows.map((r) => r.doc);
  } catch (err) {
    console.error("Error obteniendo documentos", err);
    return [];
  }
}

// Eliminar un documento
async function dbDelete(id) {
  try {
    const doc = await localDB.get(id);
    return await localDB.remove(doc);
  } catch (err) {
    console.error("Error eliminando documento", err);
  }
}

// Exportar funciones globalmente
window.dbSave = dbSave;
window.dbGetAll = dbGetAll;
window.dbDelete = dbDelete;
window.localDB = localDB;
