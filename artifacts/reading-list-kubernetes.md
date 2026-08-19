# Where to read the real thing

Field Guide 02 explains a widely documented architectural pattern. If you want it
from the projects that built it rather than from a cartoon professor, start here.
Every link below is a primary source — the official Kubernetes or Docker
documentation, or the standards body behind the underlying spec.

## The control plane

**Kubernetes Components** — Kubernetes documentation, Concepts / Overview.
The canonical breakdown of a cluster into control-plane components (kube-apiserver,
etcd, kube-scheduler, kube-controller-manager, cloud-controller-manager) and
node components (kubelet, kube-proxy, container runtime).
<https://kubernetes.io/docs/concepts/overview/components/>

This is the source for the table in the guide. It is also where "the control
plane decides, it does not execute" is stated directly rather than paraphrased.

**kube-scheduler** — Kubernetes documentation, Concepts / Scheduling.
The specific control-plane component responsible for the placement decision the
guide describes: which machine a given pod should run on.
<https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/>

## The kubelet

**Kubelet** — Kubernetes documentation, Concepts / Overview / Components.
The per-machine agent itself: what it watches, what it reports back, and its
relationship to the container runtime running underneath it.
<https://kubernetes.io/docs/reference/command-line-tools-reference/kubelet/>

**Container Runtime Interface (CRI)** — Kubernetes documentation, Concepts /
Containers. Explains the actual mechanism the guide compresses into "the same
container engine Docker uses": the kubelet talks to a pluggable container
runtime through a standard interface, not to Docker specifically.
<https://kubernetes.io/docs/concepts/architecture/cri/>

## What Docker actually does

**Docker overview** — Docker documentation, Get Started.
Docker's own description of its job: building an image, and running it as a
container on a single Docker host. The scope the guide calls "one box, one
machine."
<https://docs.docker.com/get-started/docker-overview/>

**Containerd** — the industry-standard container runtime originally extracted
from Docker, now a Cloud Native Computing Foundation graduated project and one
of the runtimes Kubernetes talks to via CRI. Useful for seeing why "Docker" and
"the thing that starts a container" are not actually the same object.
<https://containerd.io/>

## The broader pattern

**Kubernetes documentation home** — <https://kubernetes.io/docs/home/>
The primary source for everything above, and for what the guide leaves out
entirely: services, networking, storage, and the reconciliation-loop pattern
that "resurrecting the dead" is a simplification of.

**Cloud Native Computing Foundation** — <https://www.cncf.io/>
The neutral foundation that hosts both Kubernetes and containerd, among other
projects in the same ecosystem.

---

*Field Guide 02 is an independent educational breakdown. It is not affiliated
with, endorsed by, or produced in cooperation with Docker, Inc., the Kubernetes
project, or the Cloud Native Computing Foundation. The links above are to
publicly published material by their respective authors.*
