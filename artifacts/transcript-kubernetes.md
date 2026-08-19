# Transcript — Field Guide 02: Kubernetes Has Never Started a Container

Full narration from the video, by section. Roughly 220 words, about a minute forty.

## Hook

Kubernetes has never once started a container. Not one. Yet everyone credits it for the whole show.

## S1 — What Docker actually does

Docker takes your code, stuffs it into a tidy little box called a container, and can run that box — right there, on one single machine. That part, everyone gets right.

## S2 — The problem Docker can't solve

But what happens when you have four hundred of these boxes, scattered across sixty machines? Who decides which box goes where? Who notices when one dies in the night and quietly wheels in a replacement? Docker has no idea. Docker only knows the one box in front of it.

## S3 — What Kubernetes actually is

That's Kubernetes. A great glowing brain in the sky, deciding placement, counting replicas, rerouting traffic, resurrecting the dead. Magnificent! Except — and here's the part that keeps me up at night — Kubernetes has no hands. It cannot start a container itself. It simply barks an order at a small assistant living on each machine, and THAT assistant, using the same container engine Docker uses, does the actual starting.

## S4 — Payoff

So Kubernetes doesn't replace Docker. It never did! It just stands on a balcony, pointing, while somebody else's hands do the work — and somehow gets ALL of the credit. Typical management. Good night, everyone.

## Closing call

Comment KUBERNETES and I'll send you the diagram. Don't make me repeat myself.
