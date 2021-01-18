// Create sudoku board and implement backtracking algorithm for solving

// visual settings
const WIDTH = 330;
const HEIGHT = 330;
const GRID_SIZE = 32;
const GRID_PAD = 2;

const LINE_COL = "#454545";
const CELL_COL = "#ffffff";
const ACTIVE_COL = "#cceeff"
const CORRECT_COL = "#0033dd";
const WRONG_COL = "#ee0000";
const STANDARD_COL = "#000000";
const FONT = "Verdana";
const FONT_SIZE = GRID_SIZE

let canvas = document.getElementById("gameScreen");
let ctx = canvas.getContext('2d');

let cells = [];
let valSquare = [[], [], [], [], [], [], [], [], []];
let valRow = [[], [], [], [], [], [], [], [], []];
let valColumn = [[], [], [], [], [], [], [], [], []];


class Grid {
    // create cell on sudoku board
    constructor(i, j, row, col) {
        this.id = `${i*3+j}${row+i*3}${col+j*3}`;  // square, row, col
        this.x = (col*GRID_SIZE + col*GRID_PAD + GRID_PAD*4)
                    + j*(GRID_SIZE + GRID_PAD*2)*3;
        this.y = (row*GRID_SIZE + row*GRID_PAD + GRID_PAD*4)
                    + i*(GRID_SIZE + GRID_PAD*2)*3;
        this.size = GRID_SIZE;
        this.value = 0;
        this.active = false;
        this.correct = false;
        this.mutable = true;
    };

    draw(ctx) {
        paint(ctx, this.x, this.y, this.size, this.size, CELL_COL)
    };

};


class Caret {
    // change cell to active and allow user's input
    constructor (current) {
        this.x = current.x
        this.y = current.y
        this.size = current.size
    };

    draw(ctx) {
        paint(ctx, this.x, this.y, this.size, this.size, ACTIVE_COL)
    };

    input(code, current, ctx, value = false) {
        let write = true;
        if (!value) {
            if (code < 58 && code > 48) {  // 1..9 keyboard
                current.value = code - 48;
            }
            else if (code < 106 && code > 96) {  // 1..9 numpad
                current.value = code - 96;
            }
            else if (code === 46 || code === 8) { // backspace or delete
                    current.value = 0;
                    write = false;
            }
        } else {
            current.value = value;
        }
        paint(ctx, current.x, current.y, current.size, current.size,
            STANDARD_COL, FONT_SIZE, FONT, current.value, write)
        checkValues([valSquare, valRow, valColumn]);
    };

};


function paint(context, x, y, x2 = 0, y2 = 0, color = STANDARD_COL,
    fontsize = 8, font = "Arial", text = false, fill = true) {
    // paint input value in chosen cell
    context.clearRect(x, y, x2, y2);
    if (fill) {
        context.fillStyle = color;
        if (text) {
            context.font = `${fontsize}px ${font}`;
            x += 6;
            y += 28;
            context.fillText(`${text}`, x, y)
        } else if (text !== 0) {
            context.fillRect(x, y, x2, y2);
        }
    }
}


function checkValues(checkList) {
// check sudoku rules and change cells color if they are wrong
    let wrongInputs = [];
    let count = 0;
    for (let i = 0; i < checkList.length; i++) {
        let currentList = checkList[i];
        for (let i = 0; i < currentList.length; i++) {
            for (let j = 0; j < currentList[i].length; j++) {
                if (currentList[i][j].value !== 0) {
                    if (currentList[i][j].mutable) {
                        fontColour = CORRECT_COL;
                    } else {
                        fontColour = STANDARD_COL;
                    }
                    paint(ctx, currentList[i][j].x, currentList[i][j].y,
                        currentList[i][j].size, currentList[i][j].size,
                        fontColour, FONT_SIZE,
                        FONT, currentList[i][j].value)
                    currentList[i][j].correct = true;
                }
                for (let k = 0; k < currentList[i].length; k++) {
                    if (currentList[i][j].value !== 0
                        && currentList[i][k].value !== 0) {
                        if (currentList[i][j].value
                            === currentList[i][k].value) {
                            count++ // counter for repeated values
                        }
                    }
                };
                if (count >= 2) {
                    wrongInputs.push(currentList[i][j])
                }
                count = 0;
            };
        };

        // change font color for not correct values on the board
        for (let i = 0; i < wrongInputs.length; i++) {
            paint(ctx, wrongInputs[i].x, wrongInputs[i].y,
                wrongInputs[i].size, wrongInputs[i].size,
                 WRONG_COL, FONT_SIZE, FONT, wrongInputs[i].value)
            wrongInputs[i].correct = false;
        }
    }

    // Win conditions:
    let correctInput = 0;
    for (let i = 0; i < cells.length; i++) {
        if (!cells[i].correct) {
            break;
        } else {
            correctInput ++
        }
    }
    if (correctInput == 81) {
        alert('You solved puzzle!')
    }
};

function possible(cell, number) {
    // check if it is possible to enter number in cell
    for (let item = 0; item < cells.length; item++) {
        if (cells[item].id[0] == cell.id[0]
            || cells[item].id[1] == cell.id[1]
            || cells[item].id[2] == cell.id[2]) {

                if (cells[item].value == number) {
                    return false;
                }
        }
    }
    return true;
}

function input(x = 0, y = 0, cell, value = false) {
    // listen for user's input
    if (!value) {
        if (cell.mutable
            && y > cell.y
            && y < cell.y + cell.size
            && x > cell.x
            && x < cell.x + cell.size) {
                let caret = new Caret(cell)
                caret.draw(ctx)
                    // get code of input
                    document.addEventListener("keydown",
                            function temp(event) {
                        caret.input(event.keyCode, cell, ctx);
                        document.removeEventListener('keydown', temp);
                    });
        }
    } else {
        let caret = new Caret(cell)
        caret.draw(ctx)
        caret.input(value, cell, ctx);
    }
}



// create 81 cells in 9 3x3 squares
for (let i = 0; i < 3; i++) {  // row of board
    for (let j = 0; j < 3; j++) {  // column of board
        for (let row = 0; row < 3; row++) {  // row of 3x3 square
            for (let col = 0; col < 3; col++) {  // column of 3x3 square
                cells.push(new Grid(i, j, row, col))
            };
        };
    };
};

// create list of values for 3x3 squares, rows, columns
for (let j = 0; j < 9; j++) {
    for (let i = 0; i < cells.length; i++) {
        if (cells[i].id[0] == j) {
            valSquare[j].push(cells[i]);
        }
        if (cells[i].id[1] == j) {
            valRow[j].push(cells[i]);
        }
        if (cells[i].id[2] == j) {
            valColumn[j].push(cells[i]);
        }
    };
};

// Draw background of board
paint(ctx, 0, 0, WIDTH, HEIGHT, LINE_COL)

// Draw board
for (let i = 0; i < cells.length; i++) {
        cells[i].draw(ctx);
};

// get position of mouse click
canvas.addEventListener('click', event => {
    let x = event.pageX - canvas.offsetLeft;
    let y = event.pageY - canvas.offsetTop;

    // set clicked cell as ready for input
    cells.forEach(function(cell) {
        input(x, y, cell);
    });
});

// set board with immutable values
board = [
        [7, 2, 0, 0, 6, 9, 0, 0, 4],
        [0, 0, 9, 0, 3, 0, 0, 5, 0],
        [8, 0, 0, 4, 0, 0, 2, 6, 0],
        [0, 6, 0, 9, 0, 0, 0, 0, 8],
        [0, 3, 0, 0, 8, 0, 0, 1, 0],
        [5, 0, 0, 0, 0, 2, 0, 4, 0],
        [0, 5, 1, 0, 0, 4, 0, 0, 6],
        [0, 8, 0, 0, 2, 0, 4, 0, 0],
        [4, 0, 0, 3, 7, 0, 0, 2, 5]
        ]

for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[i].length; j++) {
        if (board[i][j] !== 0) {
            for (let k = 0; k < cells.length; k++) {
                if (cells[k].id[1] == i && cells[k].id[2] == j) {
                    cells[k].value = board[i][j];
                    cells[k].mutable = false;
                }
            }
        }
    }
}

checkValues([valSquare, valRow, valColumn])
mutableCells = [];

for (let i = 0; i < cells.length; i++) {
    if (cells[i].mutable) {
        mutableCells.push(cells[i]);
    }
}

function clearBoard() { // called on button click
    for (let i = 0; i < mutableCells.length; i++) {
        mutableCells[i].value = 0;
    }
    for (let i = 0; i < cells.length; i++) {
        paint(ctx, cells[i].x, cells[i].y, cells[i].size, cells[i].size,
            STANDARD_COL, FONT_SIZE, FONT, cells[i].value)
    }
}

// backtracking algorithm
function solve() { // called on button click
    for (let item = 0; item < mutableCells.length; item++) {
        if (mutableCells[item].value == 0) {
            for (let num = 1; num < 10; num++) {
                if (possible(mutableCells[item], num)) {
                    mutableCells[item].value = num;
                    paint(ctx, mutableCells[item].x,
                        mutableCells[item].y, mutableCells[item].size,
                        mutableCells[item].size, CORRECT_COL,
                        FONT_SIZE, FONT, mutableCells[item].value)
                    if (solve()) {
                        return true;
                    } else {
                        mutableCells[item].value = 0;
                        paint(ctx, mutableCells[item].x,
                            mutableCells[item].y,
                            mutableCells[item].size,
                            mutableCells[item].size, CORRECT_COL,
                            FONT_SIZE, FONT, mutableCells[item].value)
                    }
                }
            }
            return false;
        }
    }

    alert("solved")
    return true;
}
