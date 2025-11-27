## URL Parameter Sync

### What is included
- Every configurable field from the wizard (ratios, colors, spacing, offsets, flips, layout, export settings, verified badge tuning).
- Parameters are written in plain English, for example  
  `?aspectRatio=4:5&bgType=solid&bgColor=ffffff&nameSize=17`.

### How it works
- On load we read the current search params and merge them with the default project state.
- If any URL params are present we skip IndexedDB so the shared link has priority.
- Every change in the editor updates the URL after 500â€¯ms (debounced) using `history.replaceState`.
- The share button in Step 4 copies the full link (`https://app/?aspectRatio=â€¦`) to the clipboard.

### What is excluded
- Heavy blobs: profile image, mosaic images and video files stay in IndexedDB only.

### Implementation notes
- `client/src/hooks/useUrlState.ts`
  - `readStateFromUrl()` parses the search string into a partial `ProjectState`.
  - `useUrlSync()` keeps the URL in sync and exposes `copyShareLink` / `getShareLink`.
- `client/src/contexts/ProjectContext.tsx`
  - Initial state = `defaultState` merged with the partial from `readStateFromUrl`.
  - Draft loading from IndexedDB is skipped when the URL already contains params.
  - `updateState` performs a deep merge so partial updates remain safe.

### Usage
1. Configure the project.
2. Go to Step 4 and click â€œCopiar Link de Configuracaoâ€.
3. Share or store the generated link. Reopening the link restores every setting automatically.

