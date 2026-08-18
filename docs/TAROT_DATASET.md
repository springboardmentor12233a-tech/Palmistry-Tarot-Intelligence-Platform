# Tarot Dataset

## Dataset Source

Dataset: Tarot Deck

Provider: Kaggle user `lsind18`

URL: https://www.kaggle.com/datasets/lsind18/tarot-json

## Source Summary

The dataset page describes a JSON tarot dataset representing 78 cards with corresponding Rider-Waite-Smith deck scans.

According to the dataset listing, it includes:

- `tarot-images.json`
- `cards/`

The JSON file contains card information such as card name, card number, arcana, suit, image filename reference, fortune-telling phrases, keywords, meanings, and questions to ask. The `cards/` folder contains 78 card images.

## Planned Project Location

```text
data/
  tarot/
    tarot-images.json
    cards/
```

## Fields Planned For Use

- Name.
- Number.
- Arcana.
- Suit.
- Image filename.
- Keywords.
- Fortune-telling text.
- Light meanings.
- Shadow meanings.
- Questions to ask.

## Loading Plan

The backend tarot service will:

1. Read `data/tarot/tarot-images.json`.
2. Validate that card records exist.
3. Map each card image field to `data/tarot/cards/<filename>`.
4. Serve card metadata through `/api/tarot/cards`.
5. Draw cards for spreads without duplicates.
6. Use the card fields to generate interpretations.

## Download Plan

Kaggle datasets often require login or an API token. If direct download is unavailable, the beginner-friendly manual setup will be:

1. Open https://www.kaggle.com/datasets/lsind18/tarot-json
2. Sign in to Kaggle.
3. Click Download.
4. Extract the downloaded archive.
5. Copy `tarot-images.json` into `data/tarot/`.
6. Copy the `cards/` folder into `data/tarot/cards/`.

## Current Status

Dataset not downloaded yet in Phase 1. The folders have been prepared.

IMPLEMENTED:

- `data/tarot/`
- `data/tarot/cards/`
- Documentation of the required dataset source.

PLANNED:

- Add the real `tarot-images.json` file from the Kaggle dataset.
- Add the real card image files from the Kaggle dataset.
- Build backend dataset loading in a later phase.

Important: do not create fake tarot data. The application must use the specified dataset when tarot features are implemented.
