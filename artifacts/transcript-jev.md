# Transcript — Field guide Nº020

**The answer is a move.** Full narration, by section.
Timings are from the rendered film (139.27s, provisional; VO awaiting founder ear-check).

## The answer is a move

**Farnsworth** &nbsp;`0:00`  
This AI plays Doom. Its answer isn't a paragraph. It's the next move. Let me show you how a game situation becomes a decision.

## Freeze and reveal the input

**Farnsworth** &nbsp;`0:11`  
Pause there. The useful input is the game state: things like health, ammunition and what's nearby. That's information the program can pass into a decision.

## Ask a precise question

**Farnsworth** &nbsp;`0:23`  
Add a goal and a set of allowed moves. Then ask one precise question: which move fits this situation? The recording's instruction says: don't fire, simply dodge.

## Make the code legible

**Farnsworth** &nbsp;`0:37`  
In simplified code, read the state, ask for a decision, then let the game apply the selected action. The model chooses; the surrounding program does the work.

## Return to the action

**Farnsworth** &nbsp;`0:50`  
Back in the recording, movement and firing have separate outputs. Follow the movement route to MOVE. But firing continues. Choosing a move doesn't mean the whole instruction was obeyed.

## Why Jev is different

**Farnsworth** &nbsp;`1:05`  
A language model normally generates its response piece by piece, even when that response is structured data. TypeSafe's Jev is built to return typed decisions directly, without generating that text.

## Three question types

**Farnsworth** &nbsp;`1:20`  
TypeSafe calls this a System One model. Choice selects an option. Score rates a defined scale. Noul estimates the probability of yes. Independent questions can be asked together.

**Farnsworth** &nbsp;`1:34`  
TypeSafe reports responses in half a second or less. That's its published range, not a stopwatch on this recording.

## Keep correctness separate

**Farnsworth** &nbsp;`1:42`  
That's the catch: a valid answer can still be the wrong move. Your program must check the result against its rules before acting, and decide when to stop or ask a person.

## Open-Jev and the payoff

**Farnsworth** &nbsp;`1:56`  
There's also Open-Jev: independent open-source work inspired by the idea. It's not TypeSafe's model, and the same performance isn't promised. Keep language models for explanations. Use a decision model where your code needs a choice.

**Farnsworth** &nbsp;`2:16`  
Comment JEV and I'll send you the guide.
