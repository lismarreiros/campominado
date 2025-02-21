// Logic

const TILE_STATUSES = {
    HIDDEN: 'hidden',
    MINE: 'mine',
    NUMBER: 'number',
    MARKED: 'marked'
}

const BOARD_SIZE = 10
const NUMBER_OF_MINES = 10


// função que cria um quadro
export function createBoard(boardSize, numberOfMines) {
    const board = []
    const minePositions = getMinePositions(boardSize, numberOfMines) // essa função vai dar x locais aleatórios, de acordo com o numéro de minhas, dentro da board, que vão ser minas!
    // vai ser uma arrays de valores
    for (let x = 0; x < boardSize; x++) {
        const row = [] 
        for (let y = 0; y < boardSize; y++) {
            const element = document.createElement('div')
            element.dataset.status = TILE_STATUSES.HIDDEN
            
            const tile = {
                element,
                x,
                y,
                mine: minePositions.some(positionMatch.bind(null, { x, y })), // está checando se alguma das posições da mina é igual as coordenadas acima -- então true o tile vai ser uma mina, false só um tile normal
                get status() {
                    return this.element.dataset.status
                },
                set status(value) {
                    this.element.dataset.status = value
                }
            } 
            row.push(tile)
        }
        board.push(row)
    } 
    return board
}

// função que vai checar cada tile, procurando os que estão revelados como número, os escondidos ou os marcados
function checkWin(board) {
    return board.every(row => {
        return row.every(tile => {
            return tile.status === TILE_STATUSES.NUMBER || 
            (tile.mine &&  (tile.status === TILE_STATUSES.HIDDEN || tile.status === TILE_STATUSES.MARKED)) // essa linha de código confere se a mina está escondida ou com uma flag!
        })
    })
}

function checkLose(board) {
    return board.some(row => {
        return row.some(tile => {
            return tile.status === TILE_STATUSES.MINE
        })
    })
}

function getMinePositions(boardSize, numberOfMines) {
    const positions = []
    
    while (positions.length < numberOfMines) {
        const position = {
            x: randomNumber(boardSize),
            y: randomNumber(boardSize)
        }
        // se não estiverem na mesma posição, adiciona a mina 
        if (!positions.some(positionMatch.bind(null, position))) {
            positions.push(position)
        }
    }

    return positions
}

function positionMatch(a, b) {
    return a.x === b.x && a.y === b.y
}

function randomNumber(size) {
    return Math.floor(Math.random() * size)
}

// função para marcar tiles
function markTile(tile) {
    // primeiro checar se o tile que vai ser marcado é elegível de ser marcado, por que
    // só é possível marcar um tile que esteja escondido 
    // ou desmarcar um tile que esteja marcado

    if (tile.status !== TILE_STATUSES.HIDDEN && tile.status !== TILE_STATUSES.MARKED) {
        return // não acontecerá nada
    }

    // vai desmarcar uma marcada!
    if (tile.status === TILE_STATUSES.MARKED) {
        tile.status = TILE_STATUSES.HIDDEN
    } else {
        tile.status = TILE_STATUSES.MARKED
    }
}

function revealTile(board, tile) {
   // primeiro checar se é elegível de revelar -- ou seja, somente os escondidos!
   if (tile.status !== TILE_STATUSES.HIDDEN) {
    return // nada ocorre, pois já está revelado ou marcado
   } 

   // checar se é uma mina - se mine é true, muda o status
   if (tile.mine) {
    tile.status = TILE_STATUSES.MINE
    return
   }

   tile.status = TILE_STATUSES.NUMBER
   const adjancentTiles = nearbyTiles(board, tile) // função para pegar as células vizinhas
   const mines = adjancentTiles.filter(t => t.mine) // vai dizer quantas minas há por perto
   if (mines.length === 0) {
    adjancentTiles.forEach(revealTile.bind(null, board)) // vai ficar mostrando todos os tiles 'vazios' perto do primeiro apertado até que não tenhas mais o que revelar
   } else {
    tile.element.textContent = mines.length
   }
}

function nearbyTiles(board, { x, y }) {
    const tiles = []

    for(let xOffset = -1; xOffset <= 1; xOffset++) {
        for(let yOffset = -1; yOffset <= 1; yOffset++) {
            const tile = board[x + xOffset]?.[y + yOffset] // pegar o tile daquele local! -1 1, ou seja do lado
            if (tile) tiles.push(tile)
        }
    }
    return tiles
}

// criando o quadro + estilizando de acordo com o tamanho
const board = createBoard(BOARD_SIZE, NUMBER_OF_MINES)
const boardElement = document.querySelector('.board')
const minesLeftText = document.querySelector('[data-mine-count]')
const messageText = document.querySelector('.subtext')

board.forEach(row => {
    row.forEach(tile => {
        boardElement.append(tile.element)
        tile.element.addEventListener('click', () => { // Left clicks on tiles
            revealTile(board, tile)
            checkGameEnd()
        })
        tile.element.addEventListener('contextmenu', e => { // Right clicks on tiles
            e.preventDefault()
            markTile(tile)
            listMinesLeft(tile)
        })
    })
})

boardElement.style.setProperty("--size", BOARD_SIZE)
minesLeftText.textContent = NUMBER_OF_MINES 

// função que conta o número de minas que ainda falta 
function listMinesLeft() {
    const markedTilesCount = board.reduce((count, row) => {
        return count + row.filter(tile => tile.status === TILE_STATUSES.MARKED).length
    }, 0)

    minesLeftText.textContent = NUMBER_OF_MINES - markedTilesCount
}

function checkGameEnd() {
    const win = checkWin(board)
    const lose = checkLose(board)

    if (win || lose) {
        boardElement.addEventListener('click', stopProp, { capture: true})
    }

    if (win) {
        messageText.textContent = 'You Win!'
    }

    if (lose) {
        messageText.textContent = 'You Lost :('
        board.forEach(row => {
          row.forEach(tile => {
            if (tile.status === TILE_STATUSES.MARKED) markTile(tile) // vai desmarcar os marcados
            if (tile.mine) revealTile(board, tile) // vai revelar as minas, até as que foram marcadas
          })  
        })
    }
}

function stopProp(e) {
    e.stopImmediatePropagation()
}