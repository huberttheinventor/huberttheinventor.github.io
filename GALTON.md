GALTON: the static-to-picture card (Hubert, film 13)

1. Photo + many small random kicks = static.
   Each pixel is nudged lighter or darker many times. Added up, the nudges pile into a bell curve,
   the same way balls through a Galton board pile up in the middle bins.
2. The model learns to guess the kicks.
   Training adds a known dose of noise to a real photo and scores the model on guessing that noise.
3. Picture = static minus guesses, repeated.
   Start from fresh static drawn from the same bell, subtract a little of the model's guess, and repeat
   until a new picture appears, almost always not a copy of any training photo.

Illustration. The pixel grids are a teaching picture. Pixel-space diffusion (DDPM) adds noise to the
pixels; Stable Diffusion v1 adds it to a 64x64x4 latent, a compressed version of the image, and
decodes the result back to pixels at the end.

What this card leaves out
- Galton board: an analogy for why many small independent kicks add up to a bell curve.
  DDPM draws its noise straight from a Gaussian.
- Training uses 1000 noise levels (DDPM: "We set T=1000 for all experiments"; SD v1 config
  timesteps: 1000). SD v1's txt2img script samples in 50 steps by default (--ddim_steps 50).
- img2img and inpainting start from a noised copy of an input image, not from pure static.
- Memorisation: diffusion models can occasionally reproduce a training image almost exactly, mostly
  images duplicated many times in the training set. Carlini et al. 2023 extracted 109 such images from
  Stable Diffusion out of 175 million generations aimed at its 350,000 most-duplicated training
  examples (arXiv 2301.13188, section 4.2.2).
- "Guess the noise" is the DDPM and SD v1 objective (parameterization "eps"). Later models train
  other targets.

Sources
- Ho, Jain, Abbeel 2020, Denoising Diffusion Probabilistic Models: https://arxiv.org/abs/2006.11239
- CompVis stable-diffusion (v1 code and configs): https://github.com/CompVis/stable-diffusion
- Galton board: https://en.wikipedia.org/wiki/Galton_board
- Carlini et al. 2023, Extracting Training Data from Diffusion Models: https://arxiv.org/abs/2301.13188

Original Hubert diagram and explanation. Independent; not affiliated with Stability AI or CompVis.
