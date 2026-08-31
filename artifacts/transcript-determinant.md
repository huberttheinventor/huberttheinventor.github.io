# Transcript — Field guide Nº009

**The determinant is a volume.** Full narration, by section.
Timings are from the rendered film (229.67s).


## The hook

**Farnsworth** &nbsp;`0:00`  
Fry, do you know what the determinant of a matrix is?

**Fry** &nbsp;`0:04`  
Oh yeah, that's easy. A D minus B C, right?

**Farnsworth** &nbsp;`0:07`  
No. You mathematical troglodyte. Technically right, but completely meaningless.

**Farnsworth** &nbsp;`0:13`  
Let me show you a useful geometric intuition.


## Columns as vectors

**Farnsworth** &nbsp;`0:17`  
Let's start with a three by three matrix. Every matrix has columns.

**Farnsworth** &nbsp;`0:23`  
Pull those columns out and draw them as vectors from the origin.

**Fry** &nbsp;`0:27`  
Okay, so we've got three arrows coming out of the origin. I'm following.

**Farnsworth** &nbsp;`0:31`  
Now look at the shape they span.

**Farnsworth** &nbsp;`0:34`  
Those three column vectors form the edges of a parallelepiped.

**Farnsworth** &nbsp;`0:39`  
The volume of that parallelepiped is the absolute value of the determinant.

**Fry** &nbsp;`0:45`  
So the determinant is the volume of the shape formed by the column vectors. I get it.

**Farnsworth** &nbsp;`0:49`  
Generally, it's an n-dimensional volume for n columns.

**Farnsworth** &nbsp;`0:54`  
In two D, you get area. In three D, you get volume. And so on.


## The flattening

**Farnsworth** &nbsp;`1:00`  
Now, this is important. The determinant is zero if and only if the volume that the columns form has flattened.

**Fry** &nbsp;`1:09`  
Oh yeah, that's obvious. If the volume that the columns span flattens, then it can't have any volume. Like how a flattened cube has no volume.

**Farnsworth** &nbsp;`1:18`  
But zero volume tells us something important about the dimension of the column span. Specifically, the dimension of the column span has to have decreased.

**Fry** &nbsp;`1:31`  
Wait, what? What does the dimension of the column span have to do with volume being zero?

**Farnsworth** &nbsp;`1:36`  
Think about it like this. If you have n column vectors, take n minus one of them. That's your parallelepiped's base. The nth vector's height above that base is the height of the parallelepiped. If the volume is zero, then the height must be zero.

**Farnsworth** &nbsp;`1:57`  
Which must mean the nth vector lies in the base, which makes it linearly dependent. That's a decrease in dimensionality of the column span.

**Fry** &nbsp;`2:08`  
Wait, but the volume can be zero if the base shrinks to zero, too.

**Farnsworth** &nbsp;`2:11`  
Good catch. But we can just apply the same argument to the n minus one dimensional base. The base case is that in two D, the base length is zero only if we lose the base vector.

**Fry** &nbsp;`2:27`  
Oh, I see. So zero volume means decrease in dimension of the column span. Got it. But why does that matter?


## Why it matters

**Farnsworth** &nbsp;`2:33`  
It matters because it tells us about a lot of important properties of the matrix. One example is the invertibility of the matrix.

**Farnsworth** &nbsp;`2:43`  
If the determinant is zero, then the inverse of a matrix doesn't exist.

**Fry** &nbsp;`2:49`  
And why does decreasing dimensionality make a matrix not invertible?

**Farnsworth** &nbsp;`2:54`  
The flattened subspace on the right is clearly lower dimensional than its input space, so the map can't be injective.

**Farnsworth** &nbsp;`3:02`  
That means you can't recover a unique input from each output, since multiple inputs map to each output. Therefore, the matrix is not invertible.

**Fry** &nbsp;`3:13`  
Oh, I see. So the volume is actually a pretty useful proxy for understanding the subspace, the column span.

**Farnsworth** &nbsp;`3:20`  
Exactly right.


## The test

**Fry** &nbsp;`3:22`  
So in summary, the determinant tells you whether the columns of your matrix fill up space or collapse into something smaller.

**Farnsworth** &nbsp;`3:30`  
That's exactly it. The determinant is equal to the volume scaling factor of a matrix. We use this volume as a test to understand related subspaces. Follow for more.
