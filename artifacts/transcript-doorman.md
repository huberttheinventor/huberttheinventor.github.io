# Transcript — Field guide Nº013

**Ten servers, one door.** Full narration, by section.
Timings are from the rendered film (126.90s).


## Eight hours, and the servers were fine

**Farnsworth** &nbsp;`0:00`  
GitHub was down for eight hours. The servers were not the problem.

**Fry** &nbsp;`0:05`  
Then what was?

**Farnsworth** &nbsp;`0:07`  
The thing standing in front of them.


## One server, ten thousand requests

**Farnsworth** &nbsp;`0:09`  
One server, ten thousand requests a second, and it falls over.

**Fry** &nbsp;`0:14`  
So buy a bigger one.

**Farnsworth** &nbsp;`0:15`  
There is no bigger one. So you buy ten small ones, a request arrives, and which of the ten gets it?


## One door in front

**Farnsworth** &nbsp;`0:22`  
That is the entire job of a load balancer. One door in front, any number of machines behind it.

**Farnsworth** &nbsp;`0:30`  
The obvious rule is everyone in turn. Round and round.

**Fry** &nbsp;`0:34`  
Seems fair.

**Farnsworth** &nbsp;`0:35`  
Fair, and stupid. One request is a login. The next is a forty-second report. Taking turns hands the next one to the busiest box anyway.

**Farnsworth** &nbsp;`0:46`  
So send it to whoever has the fewest open connections. Which means watching all ten, all the time.


## Two at random

**Farnsworth** &nbsp;`0:55`  
Except you do not have to. Pick two at random and send it to the emptier one.

**Fry** &nbsp;`1:00`  
Just two?

**Farnsworth** &nbsp;`1:01`  
Just two. The proof is from 1996. One random pick is dreadful. Two is nearly as good as watching everything. Three barely helps.

**Farnsworth** &nbsp;`1:13`  
NGINX ships it. Your traffic is probably in it right now.


## The pulse

**Farnsworth** &nbsp;`1:17`  
The doorman also pokes every server every few seconds. One stops answering, and it is out of the rotation, quietly, before anyone notices.


## The door as the thing that fails

**Farnsworth** &nbsp;`1:30`  
Back to GitHub. The doors themselves ran out of network, and the autoscaler was watching the wrong thing.

**Farnsworth** &nbsp;`1:38`  
Every client that got no answer asked again. Ten times the traffic, aimed at a door that was already jammed.

**Fry** &nbsp;`1:47`  
So the door was the bottleneck.

**Farnsworth** &nbsp;`1:49`  
A load balancer never made a server stronger. It makes a hundred of them behave like one. Jam the door, and all hundred vanish at once.

**Farnsworth** &nbsp;`1:59`  
Comment DOORMAN and I'll send you the schematic.
