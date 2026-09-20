# Claudex Loop resource deployment receipt

Release: `v1.0.1` resource follow-up

The published guide delivers the exact approved film and caption files from the local production release. The existing interactive illustration and page design are unchanged.

| Resource | SHA256 |
| --- | --- |
| `film.mp4` | `79bd6e7eba7eb092be7cc1e9a9a0f8f5c0300321c5b51e5966f5c47f86e4d99c` |
| `captions.srt` | `2079ef0cc4a27711b535da36c7cc380c022091d57e8bef3699e23c165963512f` |
| `captions.vtt` | `3b9de311683e7ddfb54aa209e53da7596025032c5f132ba33dc3f8a1059621c8` |

Source MP4: `C:/Users/julia/projects/hubert-audio-topic-rewrite/videos/cross-model-review-trial/cutaway-motion/renders/claudex-loop-full-narrated-master.mp4`

Source captions: `C:/Users/julia/projects/hubert-audio-topic-rewrite/videos/cross-model-review-trial/release/captions.srt` and `captions.vtt`

## Live verification

Verified 20 September 2026 against `https://huberttheinventor.github.io/claudex-loop/` after the `5433403` main release:

| URL | HTTP | Content type | Length | SHA256 |
| --- | ---: | --- | ---: | --- |
| [`film.mp4`](https://huberttheinventor.github.io/claudex-loop/film.mp4) | 200 | `video/mp4` | 42,723,577 bytes | `79bd6e7eba7eb092be7cc1e9a9a0f8f5c0300321c5b51e5966f5c47f86e4d99c` |
| [`captions.srt`](https://huberttheinventor.github.io/claudex-loop/captions.srt) | 200 | `application/x-subrip` | 1,239 bytes | `2079ef0cc4a27711b535da36c7cc380c022091d57e8bef3699e23c165963512f` |
| [`captions.vtt`](https://huberttheinventor.github.io/claudex-loop/captions.vtt) | 200 | `text/vtt; charset=utf-8` | 1,199 bytes | `3b9de311683e7ddfb54aa209e53da7596025032c5f132ba33dc3f8a1059621c8` |
| [`PLAN.md`](https://huberttheinventor.github.io/claudex-loop/PLAN.md) | 200 | `text/markdown; charset=utf-8` | 600 bytes | — |
| [`fixture.mjs`](https://huberttheinventor.github.io/claudex-loop/fixture.mjs) | 200 | `text/javascript; charset=utf-8` | 1,877 bytes | — |

The downloaded MP4, SRT and VTT hashes match their committed source files exactly.
