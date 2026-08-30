const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class PersistentStore {
  constructor(collectionName) {
    this.collectionName = collectionName;
    this.filePath = path.join(DATA_DIR, `${collectionName}.json`);
    this._ensureFile();
  }

  _ensureFile() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  _read() {
    try {
      this._ensureFile();
      const content = fs.readFileSync(this.filePath, 'utf-8');
      return JSON.parse(content || '[]');
    } catch (e) {
      console.warn(`[PersistentStore] Error reading ${this.collectionName}:`, e.message);
      return [];
    }
  }

  _write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error(`[PersistentStore] Error writing ${this.collectionName}:`, e.message);
    }
  }

  find(query = {}) {
    const items = this._read();
    return items.filter(item => {
      for (const [key, val] of Object.entries(query)) {
        if (item[key] !== val) return false;
      }
      return true;
    });
  }

  findOne(query = {}) {
    const items = this._read();
    return items.find(item => {
      for (const [key, val] of Object.entries(query)) {
        if (item[key] !== val) return false;
      }
      return true;
    }) || null;
  }

  findById(id) {
    const items = this._read();
    return items.find(item => item._id === id || (item._id && item._id.toString() === id.toString())) || null;
  }

  create(doc) {
    const items = this._read();
    const newDoc = {
      _id: doc._id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      ...doc,
      createdAt: doc.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    items.push(newDoc);
    this._write(items);
    return newDoc;
  }

  findByIdAndUpdate(id, updates) {
    const items = this._read();
    const idx = items.findIndex(item => item._id === id || (item._id && item._id.toString() === id.toString()));
    if (idx === -1) return null;

    items[idx] = {
      ...items[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this._write(items);
    return items[idx];
  }

  findOneAndDelete(query) {
    const items = this._read();
    const idx = items.findIndex(item => {
      for (const [key, val] of Object.entries(query)) {
        if (item[key] !== val) return false;
      }
      return true;
    });
    if (idx === -1) return null;
    const removed = items.splice(idx, 1)[0];
    this._write(items);
    return removed;
  }
}

const userStore = new PersistentStore('users');
const meetingStore = new PersistentStore('meetings');
const messageStore = new PersistentStore('messages');
const transcriptStore = new PersistentStore('transcripts');

module.exports = {
  userStore,
  meetingStore,
  messageStore,
  transcriptStore
};
