-- Agrega la etiqueta de categoría a las notas.
-- Es una migración segura: no borra ni modifica ninguna nota existente.
-- Las notas ya cargadas van a quedar en la categoría "otros" por defecto,
-- y se pueden reclasificar después desde el panel admin.

ALTER TABLE notes ADD COLUMN category TEXT NOT NULL DEFAULT 'otros';
