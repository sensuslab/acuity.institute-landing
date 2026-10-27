# Sacred Texts

The canonical Markdown files live in Cloudflare R2. Their original `texts/` paths, full-text-template metadata, copyright/licensing, and separate trademark metadata are recorded in `data/sources/ancient-wisdom-atlas.json`.

Run `python scripts/restore-sacred-texts.py` to restore the complete approved texts under their original paths. Interpretation belongs in `patterns/`; motif definitions in `taxonomy/`; source registry metadata in `data/sources/`. The public context archive preserves the upstream motif definitions; large generated normalization maps remain in the pinned upstream repository.

Source: Ancient Wisdom Atlas by İlayda Büyükdoğan, pinned revision `07b52ea814bd96b0d6322ec684eeb555fe9dd10f`. Original Atlas notes/templates/taxonomy are CC0; source editions retain their per-file rights and trademark notices. Selections and modern framework summaries are excluded from this complete-source collection.
