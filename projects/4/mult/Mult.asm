// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/4/Mult.asm

// Multiplies R0 and R1 and stores the result in R2.
// (R0, R1, R2 refer to RAM[0], RAM[1], and RAM[2], respectively.)
// The algorithm is based on repetitive addition.

//// Replace this comment with your code.

// Set R2 to 0
@R2
M = 0
// Check if R1 is 0. 
//      if 0, go to end
//      If gt 0, proceed
@R1
D = M
@END
D;JEQ

// Initialize counter in a temp register
@temp
M = D
(LOOP)
    @R0
    D = M
    // Go to END if R0 is 0
    @END
    D;JEQ
    @R2
    M = D + M
    @temp
    M = M - 1
    D = M
    @LOOP
    D;JGT
(END)
    @END
    0;JMP






