# Reading list — Field guide Nº009

**The determinant is a volume.** Primary sources for every claim in the guide,
in the order the guide uses them. This is the working bibliography, not decoration.

---

## The geometric definition

**Sheldon Axler, *Linear Algebra Done Right*, 4th ed., Springer, 2024.**
Chapter 9 on determinants, and the volume discussion in 9.C. Axler is the standard
reference for treating the determinant as a property of an operator rather than as
a formula to be computed, and 9.C is where the connection to volume is made
explicitly. The 4th edition is open access at
<https://linear.axler.net>.

**Gilbert Strang, *Introduction to Linear Algebra*, 6th ed., Wellesley-Cambridge,
2023.** Chapter 5. Strang derives the determinant from three properties and then
shows the area/volume interpretation falls out of them; §5.3 covers the
parallelepiped volume directly. Course materials, including the lecture on
determinants as area, are free at MIT OpenCourseWare 18.06:
<https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/>.

## The scaling-factor framing used in the film

**3Blue1Brown, *Essence of Linear Algebra*, chapter 6, "The determinant."**
<https://www.3blue1brown.com/lessons/determinant>
The source of the framing the guide's opening uses: the determinant is the factor
by which a linear transformation scales area or volume, and any region can be
approximated by grid squares, so a single factor scales all of them. The claim
that the grid and the unit square are one idea rather than two comes from here.

## Zero determinant, singularity and invertibility

**Axler, *Linear Algebra Done Right*, 3.D and 9.A.** The equivalence between an
operator being invertible, being injective, and having a non-zero determinant.
The film's argument — flattened image, therefore not injective, therefore not
invertible — is the geometric reading of this.

**Roger Horn and Charles Johnson, *Matrix Analysis*, 2nd ed., Cambridge, 2012,
§0.5.** The standard statement of the singular/invertible equivalences, if you
want the algebraic version rather than the geometric one.

## On the base-and-height argument

The argument in annotation Nº002 — take n−1 vectors as the base, the nth vector's
height above it is the solid's height, zero volume forces zero height and therefore
linear dependence — is the standard induction on dimension. It is set out in
Strang §5.3 and, in the wedge-product language, in **Michael Spivak, *Calculus on
Manifolds*, Benjamin, 1965, chapter 4**, where the determinant appears as the
alternating n-form and degeneracy is exactly linear dependence.

---

## A note on what is not claimed

The guide does not claim the determinant is *only* a volume. It is also a
characteristic-polynomial coefficient, a product of eigenvalues, and an
orientation sign — the sign of the determinant tells you whether the
transformation flips space, which the film deliberately sets aside because it
takes the absolute value throughout. That omission is a simplification, and it is
the one place the guide trades completeness for the picture.
