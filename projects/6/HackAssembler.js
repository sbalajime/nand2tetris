const fs = require("node:fs");

const SYMBOLS_MAP = {
    "R0": 0,
    "R1": 1,
    "R2": 2,
    "R3": 3,
    "R4": 4,
    "R5": 5,
    "R6": 6,
    "R7": 7,
    "R8": 8,
    "R9": 9,
    "R10": 10,
    "R11": 11,
    "R12": 12,
    "R13": 13,
    "R14": 14,
    "R15": 15,
    SP: 0,
    LCL: 1,
    ARG: 2,
    THIS: 3,
    THAT: 4,
    SCREEN: "16384",
    KBD: "24576"
}

class Parser {
    constructor(path) {
        this.inputContent = fs.readFileSync(path, 'utf8');
        this.outputFile = path.replace(".asm", ".hack")
        let lines = this.inputContent.split("\n");
        this.lines = removeUnwantedLines(lines);
        this.currentLine = null;
        this.currentInstruction = null;
    }

    hasMoreLines() {
        if (this.currentLine === null) {
            return this.lines.length > 0;
        } else {
            return this.lines.length - 1 > this.currentLine;
        }
    }

    advance() {
        if (this.currentLine === null && this.hasMoreLines()) {
            this.currentLine = 0;
            this.currentInstruction = this.lines[this.currentLine];
        } else if (this.hasMoreLines()) {
            this.currentLine = this.currentLine + 1;
            this.currentInstruction = this.lines[this.currentLine];
        }

    }

    instructionType() {
        if (this.currentInstruction.includes('@')) {
            return "A_INSTRUCTION";
        } else if (this.currentInstruction.includes(';') || this.currentInstruction.includes('=')) {
            return "C_INSTRUCTION";
        } else {
            return "L_INSTRUCTION"
        }
    }

    symbol() {
        switch (this.instructionType()) {
            case 'A_INSTRUCTION':
                return this.currentInstruction.replace("@", "");
            case "L_INSTRUCTION":
                return this.currentInstruction;
            default:
                return null;
        }
    }

    dest() {
        if (this.currentInstruction.includes("=")) {
            return this.currentInstruction.split("=")[0];
        } else {
            return null;
        }
    }

    comp() {
        if (this.currentInstruction.includes("=")) {
            let destAndJump = this.currentInstruction.split("=")[1];
            if (destAndJump.includes(";")) {
                return destAndJump.split(";")[0];
            } else {
                return destAndJump;
            }
        } else if (this.currentInstruction.includes(";")) {
            return this.currentInstruction.split(";")[0];
        } else {
            return null;
        }
    }

    jump() {
        if (this.currentInstruction.includes(";")) {
            return this.currentInstruction.split(";")[1];
        } else {
            return null
        }
    }

}

const removeUnwantedLines = (lines) => {
    let validLines = []
    for (let line of lines) {
        if (line.includes("//")) {
            continue;
        }
        if (line === "\r") {
            continue;
        }
        else {
            let newLine = line.replace("\r", "");
            newLine = newLine.trim();
            if (newLine) {
                validLines.push(newLine);
            }
        }
    }
    return validLines;
}

class Code {
    static compMap = {
        "0": "0101010",
        "1": "0111111",
        "-1": "0111010",
        "D": "0001100",
        "A": "0110000",
        "M": "1110000",
        "!D": "0001101",
        "!A": "0110001",
        "!M": "1110001",
        "-D": "001111",
        "-A": "0110011",
        "-M": "1110011",
        "D+1": "0011111",
        "A+1": "0110111",
        "M+1": "1110111",
        "D-1": "0001110",
        "A-1": "0110010",
        "M-1": "1110010",
        "D+A": "0000010",
        "D+M": "1000010",
        "D-A": "0010011",
        "D-M": "1010011",
        "A-D": "0000111",
        "M-D": "1000111",
        "D&A": "0000000",
        "D&M": "1000000",
        "D|A": "0010101",
        "D|M": "1010101"
    }
    static jumpMap = {
        JGT: "001",
        JEQ: "010",
        JGE: "011",
        JLT: "100",
        JNE: "101",
        JLE: "110",
        JMP: "111",
        null: "000"
    }
    static dest(arg) {
        if (arg) {
            let [aBit, dBit, mBit] = ["0", "0", "0"];
            if (arg.includes("M")) {
                mBit = "1"
            }
            if (arg.includes("D")) {
                dBit = "1"
            }
            if (arg.includes("A")) {
                aBit = "1"
            }
            return aBit + dBit + mBit;
        } else {
            return "000"
        }

    }
    static comp(arg) {
        return this.compMap[arg];
    }
    static jump(arg) {
        return this.jumpMap[arg];
    }

    static convertDecToBinary(arg) {
        return arg.toString(2).padStart(16, '0')
    }
}




function assembler() {
    const filePath = process.argv[2];
    let outputArr = [];
    const labelParser = new Parser(filePath);
    let labelsCount = 0;
    do {
        // go through each line
        // Find if a label exists in the format (xxx) and add it to symbols map
        labelParser.advance();
        const type = labelParser.instructionType();
        if (type === "L_INSTRUCTION") {
            let symbol = labelParser.symbol().replace("(", "").replace(")", "");
            if (!SYMBOLS_MAP.hasOwnProperty(symbol)) {
                SYMBOLS_MAP[symbol] = labelParser.currentLine - labelsCount;
                labelsCount++;
            }
        }

    } while (labelParser.hasMoreLines())
    let variableCount = 0;
    let variableBaseAddress = 16;
    const parser = new Parser(filePath);
    do {
        parser.advance();
        const type = parser.instructionType();
        if (type === "A_INSTRUCTION") {
            let symbol = parser.symbol();
            if (!SYMBOLS_MAP.hasOwnProperty(symbol) && isNaN(symbol)) {
                SYMBOLS_MAP[symbol] = variableBaseAddress + variableCount;
                variableCount++;
            }
            if (isNaN(symbol) && Object.keys(SYMBOLS_MAP).includes(symbol)) {
                let value = SYMBOLS_MAP[symbol];
                let binary = Code.convertDecToBinary(value);
                outputArr.push(binary);
            } else if (!isNaN(symbol)) {
                let binary = Code.convertDecToBinary(Number(symbol));
                outputArr.push(binary);
            }
        } else if (type === "C_INSTRUCTION") {
            let dest = parser.dest();
            let destCode = Code.dest(dest);
            let comp = parser.comp();
            let compCode = Code.comp(comp);
            let jump = parser.jump();
            let jumpCode = Code.jump(jump);
            outputArr.push(`111${compCode}${destCode}${jumpCode}`)
        }

    } while (parser.hasMoreLines());
    let outputContent = outputArr.join("\r\n")

    // Write to ouput
    let outputFile = filePath.replace(".asm", ".hack");
    fs.writeFile(outputFile, outputContent, err => { });
}



assembler();
