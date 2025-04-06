// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/4/Fill.asm

// Runs an infinite loop that listens to the keyboard input. 
// When a key is pressed (any key), the program blackens the screen,
// i.e. writes "black" in every pixel. When no key is pressed, 
// the screen should be cleared.
@8192
D = A
@max         // Total number of 16 bit words in the screen map
M = D
(START)
@SCREEN
D = A
@screenindex // Denotes i th 16 bit word of the screen map 
M = 0
@KBD
D = M
@FILL
D;JGT
@CLEAR
D;JLE
    (FILL)
        @SCREEN
        D = A
        @screenindex
        D = D + M     // @SCREEN + @screenindex
        A = D
        M = -1
        @screenindex
        M = M + 1
        D = M
        @max
        D = M - D
        @FILL
        D;JGT
        @START  // Go to START to listen for keyboard input
        D;JLE
    (CLEAR)
        @SCREEN
        D = A
        @screenindex
        D = D + M
        A = D
        M = 0
        @screenindex
        M = M + 1
        D = M
        @max
        D = M - D
        @CLEAR
        D;JGT
@START
0;JMP