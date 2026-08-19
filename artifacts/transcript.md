# Transcript — Field Guide 01: How Netflix Actually Works

Full narration from the video, by section. Roughly 365 words, about three minutes.

## Cold open

Good news, everyone! Today we're building Netflix. It sounds simple: pick a movie, press play, watch. But behind that one click hide some truly enormous problems.

## Storage

First, where do we keep all these movies? A single film can take several gigabytes, and there are thousands of them. So the originals live in big object storage. We do not fling one colossal file at your television. That would be idiotic!

## Transcode

No no no. My transcoding apparatus grinds every movie into many versions. There's 4K, 1080p, 720p, and 480p, different bitrates, different codecs.

## Adaptive bitrate

Why? Because fiber and a 4K television get a glorious stream, while the poor soul on wobbly mobile data gets a smaller one. We call it adaptive bitrate streaming. I invented it! Possibly.

## Delivery

Now, delivery! If Europe streamed from one American data center, every bit would schlep across an ocean. Slow and monstrously expensive. So we use a CDN, which puts copies on servers near the viewers. Watching from Paris? Then your movie comes from Paris! Netflix even built its own, called Open Connect.

## The two paths

Now the viewer presses play. The backend does the boring paperwork, like authentication, subscriptions, and choosing which file you deserve. But the video never squeezes through those servers. What a bottleneck! The app takes its instructions and streams straight from the CDN.

## Switching

But your internet speed flails about, so the player keeps measuring it. Speed drops, you get lower quality. It recovers, back up you go! And since videos come in little chunks, we swap quality mid-stream without you noticing.

## Scale

Now a new season drops, and millions press play at once. One server for all that? Preposterous! So the system splits into many services, for users, billing, playback, and search, each scaling alone. The databases are distributed and replicated. Losing your watch history is annoying, but losing playback is catastrophic!

## Two systems

Simplified, then: Netflix is two machines. One runs the application, with users, payments, and metadata. The other hauls the video. Storage prepares it, the CDN spreads it, and adaptive streaming picks the quality.

## The hard part

You see, the hard part was never the play button. It's delivering billions of chunks to every last person on this miserable, wonderful planet. Good night, everyone!

## Closing call

Comment NETFLIX and I'll send you the schematic.
