# Sources — Guide Nº010, Your video is a web page

Every link below was requested and returned 200 on 2026-09-01. Nothing is listed
from memory.

## The tool the guide describes

- **HyperFrames** — <https://hyperframes.heygen.com/>
  A HeyGen product. The film names it and shows its homepage and its preview
  studio. The claims made about it in the guide were checked against the CLI's
  own `--help` output on the machine that rendered this film, not against
  marketing copy: `transcribe` is described there as producing "word-level
  timestamps", `preview` as "Start the studio", and `browser` as managing "the
  Chrome used for rendering".
- **Machine-readable documentation index** —
  <https://hyperframes.heygen.com/llms.txt>

## The parts that are not anyone's product

- **Headless Chrome** — <https://developer.chrome.com/docs/chromium/headless>
  The browser mode that draws the frames. Nothing about this pipeline is
  specific to one library: rendering a page to an image, at a chosen instant, is
  a browser capability.
- **FFmpeg** — <https://ffmpeg.org/>
  Assembles the captured frames into an MP4 and lays the audio underneath.
- **WebVTT** — <https://www.w3.org/TR/webvtt1/>
  The subtitle format the timestamps are written out to. The track shipped with
  this guide was generated from the same measured word timings the film's
  captions use.

## What is not sourced, and why

No performance, pricing or market claim appears in the guide, so none is cited.
The film deliberately makes no cost claim: rendering locally has no per-render
fee, but cloud rendering is a paid path and local rendering still costs compute,
and "near zero dollars" is not a number this guide is willing to stand behind.

The film also does not describe HyperFrames as open source. Its licence was not
read, so the word is not used.

---

Independent. Not affiliated with, endorsed by, or connected to HeyGen, Google,
Anthropic, the FFmpeg project or the W3C. Nothing here was sponsored or reviewed
by any of them.
