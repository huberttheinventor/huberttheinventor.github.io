# Transcript — Nº029, "Rotating your photo is four numbers. Two are the same."

1. Hubert: Rotating your photo is four numbers. Two are the same.
2. Hubert: Let's find them. Lay the photo on a grid. From one corner draw two arrows of length one, along the bottom and up the side.
3. Fry: Four numbers for a whole photo? It's got millions of pixels.
4. Hubert: And every pixel is an address: three steps along the first arrow, two steps up the second. Turn the two arrows and every address turns with them. The pixels only follow.
5. Hubert: Now put a circle of size one around that corner and turn the photo thirty degrees. The first arrow's tip slides along the circle, and its two coordinates are our first two numbers: how far across, and how far up.
6. Hubert: Across is the cosine of the angle. Up is the sine. That is all sine and cosine are, where a tip lands on a circle of size one.
7. Fry: So you need the second arrow's angle too.
8. Hubert: You already have it. The second arrow started a quarter turn ahead and stays there, so its tip is the first tip moved ninety degrees round the circle. Across becomes minus the sine, up becomes the cosine again. There's your repeat.
9. Hubert: Four numbers, read straight off the circle. Write them in a two by two grid and that grid is the rotation matrix. Feed it any pixel's address and out comes where that pixel now sits.
10. Fry: Does that only work at thirty degrees?
11. Hubert: Any angle. Turn all the way to ninety and the numbers tick along as the tips ride the circle. They never leave it, so the arrows keep their length and their right angle, and the photo turns without stretching.
12. Hubert: So rotating your photo is four numbers, and two of them match, because the second arrow is only the first one, a quarter turn further round the same circle.
13. Hubert: Comment TURN and I'll send you the four-number card.
