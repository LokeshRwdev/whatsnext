import { openDB, IDBPDatabase } from "idb";

const DB = "ride-db";
const STORE = "events";

async function db() { 
  return openDB(DB, 1, { 
    upgrade(d: IDBPDatabase) { 
      d.createObjectStore(STORE, { keyPath: "id", autoIncrement: true }); 
    } 
  }); 
}

export async function enqueue(e: any) { 
  (await db()).add(STORE, { ...e, created_at: Date.now() }); 
}

export async function drain(flush: (e: any) => Promise<boolean>) {
  const d = await db();
  const tx = d.transaction(STORE, "readwrite");
  const s = tx.store;
  let c = await s.openCursor();
  while (c) { 
    const ok = await flush(c.value); 
    if (ok) await c.delete(); 
    c = await c.continue(); 
  }
  await tx.done;
}
