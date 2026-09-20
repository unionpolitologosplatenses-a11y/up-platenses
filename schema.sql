-- Esquema de la base de datos D1 para el sitio de la Unión de Politólogos Platenses.
-- Ejecutar con: npm run db:init (local) o npm run db:init:remote (producción)

CREATE TABLE IF NOT EXISTS institutional (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  home_tagline TEXT DEFAULT 'Unir, Potenciar y Profesionalizar',
  home_intro TEXT DEFAULT '',
  mission TEXT DEFAULT '',
  objectives TEXT DEFAULT '',
  activities TEXT DEFAULT '',
  contact_email TEXT DEFAULT 'contacto@upplatenses.org',
  contact_address TEXT DEFAULT 'La Plata, Buenos Aires, Argentina',
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO institutional (id) VALUES (1);

CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  author TEXT DEFAULT '',
  note_date TEXT NOT NULL,
  image_key TEXT DEFAULT '',
  excerpt TEXT DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'otros', -- 'local' | 'nacional' | 'internacional' | 'otros'
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'published'
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notes_status_date ON notes (status, note_date DESC);

CREATE TABLE IF NOT EXISTS editions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  cover_key TEXT DEFAULT '',
  pdf_key TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft' | 'published'
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_editions_status ON editions (status, year DESC, number DESC);
