# Where to read the real thing

Field Guide 01 explains a widely documented architectural pattern. If you want it
from the engineers who built it rather than from a cartoon professor, start here.
Every link below is a primary source — Netflix's own engineering writing, or the
standards the players actually implement.

## The encoding ladder

**Per-Title Encode Optimization** — Netflix Technology Blog, December 2015.
The post that explains why a fixed bitrate ladder is the wrong idea: a simple
animated title and a grain-heavy action film should not be encoded the same way,
so the ladder is computed per title from its own complexity.
<http://techblog.netflix.com/2015/12/per-title-encode-optimization.html>

This is the source for the caveat on the ladder table in the guide. Any table
claiming fixed per-resolution bitrates for Netflix is describing something the
company deliberately moved away from a decade ago.

**VMAF** — Netflix's perceptual video quality metric, open-sourced.
Worth knowing because it is *how* the ladder decisions get made: quality is
scored the way a human eye would judge it, not by raw signal error.
<https://github.com/Netflix/vmaf>

## The delivery network

**Netflix Open Connect** — the official site for the CDN itself, including the
appliance program and how ISPs get one.
<https://openconnect.netflix.com/>

**Serving 100 Gbps from an Open Connect Appliance** — Netflix Technology Blog.
The hardware side of the story the guide tells in Plate 03. Useful for grasping
why pushing copies outward beats optimising the long haul.
<https://netflixtechblog.com/serving-100-gbps-from-an-open-connect-appliance-cdb51dda3b99>

**Content Popularity for Open Connect** — Netflix Technology Blog.
Answers the question the guide raises but does not resolve: *which* titles get
pushed to which cache, given that no appliance can hold the whole catalogue.
<https://netflixtechblog.com/content-popularity-for-open-connect-b86d56f613b>

## Adaptive streaming itself

Adaptive bitrate is not a Netflix invention — it is an industry pattern with two
dominant implementations, and reading either one makes the segment-switching
section of the guide concrete:

- **HLS** (HTTP Live Streaming), Apple's specification.
- **MPEG-DASH**, the ISO standard equivalent.

Both work the same way in outline: a manifest lists the available renditions, the
media is cut into short segments, and the client decides which rendition to fetch
for each segment. That client-side decision is the whole of "adaptive".

## The broader engineering writing

**Netflix Technology Blog** — <https://netflixtechblog.com/>
The primary source for everything above, and for the parts the guide leaves out:
chaos engineering, regional failover, the recommendation stack, data platform.

---

*Field Guide 01 is an independent educational breakdown. It is not affiliated
with, endorsed by, or produced in cooperation with Netflix, Inc. The links above
are to publicly published material by their respective authors.*
