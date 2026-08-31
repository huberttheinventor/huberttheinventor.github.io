# Transcript — Field guide Nº009

**The determinant is a volume.** Full narration, by section.
Timings are from the rendered film (174.73s).


## The hook

**Farnsworth** &nbsp;`0:00`  
Fry, do you know what the determinant of a matrix is?

**Fry** &nbsp;`0:03`  
Oh yeah, that's easy. A D minus B C, right?

**Farnsworth** &nbsp;`0:06`  
No. You mathematical troglodyte. Technically right, but completely meaningless.

**Farnsworth** &nbsp;`0:12`  
Let me show you a useful geometric intuition.


## Columns as vectors

**Farnsworth** &nbsp;`0:16`  
Let's start with a three by three matrix. Every matrix has columns.

**Farnsworth** &nbsp;`0:21`  
Pull those columns out and draw them as vectors from the origin.

**Farnsworth** &nbsp;`0:25`  
Now look at the shape they span.

**Farnsworth** &nbsp;`0:28`  
Those three column vectors form the edges of a parallelepiped.

**Farnsworth** &nbsp;`0:32`  
The volume of that parallelepiped is the absolute value of the determinant.

**Farnsworth** &nbsp;`0:38`  
Generally, it's an n-dimensional volume for n columns.


## The flattening

**Farnsworth** &nbsp;`0:42`  
Now, this is important. The determinant is zero if and only if the volume that the columns form has flattened.

**Fry** &nbsp;`0:50`  
Oh yeah, that's obvious. If the volume that the columns span flattens, then it can't have any volume. Like how a flattened cube has no volume.

**Farnsworth** &nbsp;`0:58`  
But zero volume tells us something important about the dimension of the column span. Specifically, the dimension of the column span has to have decreased.

**Fry** &nbsp;`1:11`  
Wait, what? What does the dimension of the column span have to do with volume being zero?

**Farnsworth** &nbsp;`1:15`  
Think about it like this. If you have n column vectors, take n minus one of them. That's your parallelepiped's base. The nth vector's height above that base is the height of the parallelepiped. If the volume is zero, then the height must be zero.

**Farnsworth** &nbsp;`1:35`  
Which must mean the nth vector lies in the base, which makes it linearly dependent. That's a decrease in dimensionality of the column span.

**Fry** &nbsp;`1:45`  
Oh, I see. So zero volume means decrease in dimension of the column span. Got it. But why does that matter?


## Why it matters

**Farnsworth** &nbsp;`1:52`  
It matters because it tells us about a lot of important properties of the matrix. One example is the invertibility of the matrix.

**Farnsworth** &nbsp;`2:01`  
If the determinant is zero, then the inverse of a matrix doesn't exist.

**Fry** &nbsp;`2:06`  
And why does decreasing dimensionality make a matrix not invertible?

**Farnsworth** &nbsp;`2:11`  
The flattened subspace on the right is clearly lower dimensional than its input space, so the map can't be injective.

**Farnsworth** &nbsp;`2:19`  
That means you can't recover a unique input from each output, since multiple inputs map to each output. Therefore, the matrix is not invertible.


## The test

**Fry** &nbsp;`2:29`  
So in summary, the determinant tells you whether the columns of your matrix fill up space or collapse into something smaller.

**Farnsworth** &nbsp;`2:37`  
That's exactly it. The determinant is equal to the volume scaling factor of a matrix. We use this volume as a test to understand related subspaces. Follow for more.
