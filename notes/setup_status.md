# Setup Status

Created the initial project structure for the AI Palmistry and Tarot web app.

## Added Folders

- `colab_originals/` stores the original Colab notebooks.
- `external_repos/` stores third-party code used by the engines.
- `data/` stores runtime datasets and card images.
- `sample_inputs/` stores a few palm images for local testing.
- `generated_outputs/` will store generated PDFs during backend testing.
- `backend/` will contain the FastAPI backend.
- `frontend/` will contain the React frontend.
- `models/` is reserved for model files if needed later.
- `notes/` stores project notes.

## Files Added

- `colab_originals/PalmlineEngine.ipynb`
- `colab_originals/TarotEngine.ipynb`
- `data/tarot-images.json`
- `data/cards/` with tarot card images
- `external_repos/palmistry/` cloned from `https://github.com/yeonsumia/palmistry.git`
- `sample_inputs/Hand_0000002.jpg`
- `sample_inputs/Hand_0000003.jpg`
- `sample_inputs/Hand_0000004.jpg`

## Important Decision

The full hand image dataset from `archive.zip` was not extracted into the app because the web app should not retrain or load 11,000 images at runtime. Only a few sample images were copied for testing.

## Next Step

Convert the notebook logic into backend services:

- Palm engine wrapper around `external_repos/palmistry/code/read_palm.py`
- Tarot engine using `data/tarot-images.json` and `data/cards/`
- PDF generators for palm and tarot reports
