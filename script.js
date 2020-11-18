const Player = (name, type, symbol) => {
  return {
    name,
    marker: symbol,
    playerType: type,
    playerMoves: [],
  }
}

const App = (doc) => {
  let screen = document.getElementById('screen')

  const _toggleButtons = (buttons, name, callback) => {
    buttons.addEventListener('click', (e) => {
      if (e.target !== buttons) {
        let btn = e.target
        let type = btn.textContent.toLowerCase()

        btn.classList.add('active')

        if (btn === buttons.firstElementChild)
          buttons.lastElementChild.classList.remove('active')
        else if (btn === buttons.lastElementChild)
          buttons.firstElementChild.classList.remove('active')

        callback(type, name)
      }
    })
  }

  const _changeName = (inputs, callback) => {
    inputs.forEach(input => {
      input.addEventListener('click', () => {
        input.removeAttribute('readonly')
      })
      input.addEventListener('keyup', (e) => {
        setTimeout(() => {
          input.setAttribute('readonly', 'true')
        }, 2000)

        let name = e.target.value.toLowerCase(),
          id = e.target.id

        callback(id, name)
      })
    })
  }

  const _resetButton = (button, callback) => {
    button.addEventListener('click', callback)
  }

  const flashScreen = (text) => {
    screen.textContent = text;
  }

  const resetScreen = () => {
    screen.textContent = 'Tic Tac Toe'
  }

  const addListeners = (...callback) => {
    let inputs = Array.from(doc.querySelectorAll('input')),
      playerBtns = doc.querySelector('.btns.player'),
      enemyBtns = doc.querySelector('.btns.enemy'),
      reset = doc.getElementById('reset')

    _resetButton(reset, callback[0])
    _changeName(inputs, callback[1])
    _toggleButtons(playerBtns, 'player', callback[2])
    _toggleButtons(enemyBtns, 'enemy', callback[2])
  }

  return {
    flashScreen,
    resetScreen,
    addListeners,
  }
}

const Board = (doc) => {
  let grid = doc.getElementById('grid'),
    gridArray = []

  const addMarker = (target, symbol) => {
    let pos = target.getAttribute('data-pos').split('-').map(i => +i)
    target.classList.add(`${symbol}-marker`)

    return pos
  }

  const resetBoard = () => {
    while (grid.firstChild) {
      grid.removeChild(grid.lastChild)
    }
  }

  const addClickEvent = (callback) => {
    let cells = Array.from(doc.querySelectorAll('.cell'))

    cells.forEach(cell => {
      cell.addEventListener('click', callback, { once: true })
    })
  }

  const getBoard = () => {
    return gridArray
  }

  const createBoard = (size) => {
    gridArray = []
    grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`
    grid.style.gridTemplateRows = `repeat(${size}, 1fr)`

    for (let i = 0; i < size; i++) {
      gridArray.push([])
      for (let j = 0; j < size; j++) {
        let cell = doc.createElement('div')
        cell.classList.add('cell')
        cell.setAttribute('data-pos', `${i}-${j}`)
        grid.appendChild(cell)
        gridArray[i].push('')
      }
    }
  }

  return {
    createBoard,
    resetBoard,
    getBoard,
    addClickEvent,
    addMarker,
  }
}

const Game = ((doc) => {
  const {
    flashScreen,
    resetScreen,
    addListeners,
  } = App(doc)
  const {
    createBoard,
    resetBoard,
    getBoard,
    addClickEvent,
    addMarker,
  } = Board(doc)

  let initPlayer = {
    name: 'Player',
    type: 'human'
  }
  let initEnemy = {
    name: 'Enemy',
    type: 'bot'
  }

  let pattern3x3 = [
    [0, 0, '-'],
    [0, 0, '|'],
    [0, 0, '\\'],
    [0, 2, '/'],
  ]
  let pattern5x5 = [
    [0, 0, '-'],
    [0, 1, '-'],
    [0, 0, '|'],
    [1, 0, '|'],
    [0, 3, '/'],
    [1, 3, '/'],
    [0, 0, '\\'],
    [1, 0, '\\'],
  ]

  let player, enemy, playerTurn, size, board, MAX_DEPTH,
    counter = 0

  const _hasEmptyCells = (grid) => {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (!grid[i][j])
          return true
      }
    }
    return false
  }

  const _checkConsecutiveBlocks = (x, y, direction, limit, range, grid) => {
    let horizontalncrement = verticalIncrement = rowIncrement = columnIncrement = 0
   
    const _temp = () => {
      return {
        win: false,
        consecutiveBlocks: 0,
      }
    }

    switch (direction) {
      case '|':
        horizontalncrement = 1
        rowIncrement = 1
        break;
      case '-':
        verticalIncrement = 1
        columnIncrement = 1
        break;
      case '/':
        range = limit - 2
        horizontalncrement = 1
        columnIncrement = -1
        rowIncrement = 1
        break;
      case '\\':
        range = limit - 2
        horizontalncrement = 1
        columnIncrement = 1
        rowIncrement = 1
        break;
    }
    
    let player = _temp(),
      enemy = _temp()
    for (let m = 0; m < range; m++) {
      player = _temp()
      enemy = _temp()

      let i = x, j = y
      for (let n = 0; n < limit; n++) {
        if (grid[i][j] === 'player')
          player.consecutiveBlocks++
        else if (grid[i][j] === 'enemy')
          enemy.consecutiveBlocks++

        i += rowIncrement
        j += columnIncrement
      }

      if (player.consecutiveBlocks === limit)
        return 'player'
      if (enemy.consecutiveBlocks === limit)
        return 'enemy'

      x += verticalIncrement
      y += horizontalncrement
    }

    return;
  }

  const _checkPattern = (grid) => {
    let patterns = size === 3 ? pattern3x3 : pattern5x5
    let limit = size === 3 ? 3 : 4
    
    for (let i = 0; i < patterns.length; i++) {
      let [x, y, direction] = patterns[i]
      let winner = _checkConsecutiveBlocks(x, y, direction, limit, size, grid)

      if (winner) {
        return winner
      }
    }

    return;
  }

  const _checkForWinner = () => {
    let winner = _checkPattern(board)

    if (winner === 'player') {
      flashScreen(`${player.name} wins!`)
      setTimeout(newGame, 1500)
    } else if (winner === 'enemy') {
      flashScreen(`${enemy.name} wins!`)
      setTimeout(newGame, 1500)
    } 
    
    if (!_hasEmptyCells(board) && !winner) {
      flashScreen('It\'s a tie!')
      setTimeout(newGame, 1500)
    }

    return;
  }

  const _addMarker = target => {
    let symbol = playerTurn ? 'x' : 'o',
      [x, y] = addMarker(target, symbol)
    
    board[x][y] = playerTurn ? 'player' : 'enemy'
    playerTurn = !playerTurn
  }

  const _evaluate = (depth, grid) => {
    let winner = _checkPattern(grid),
        enemy = playerTurn ? 'enemy' : 'player'
      
      if (!winner) 
        return 0;

      if (winner === enemy)
        return -10;
      else
        return 10;
  }

  const _minimax = (depth, grid, maximizingPlayer, enemyTurn, alpha, beta) => {
    counter++
    let score = _evaluate(depth, grid)

    if (depth === MAX_DEPTH)
      return 0;
    
    if (score > 0 || score < 0)
      return score;    

    if (!_hasEmptyCells(grid)) 
      return 0;

    let bestVal = maximizingPlayer ? -Infinity : Infinity
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (grid[i][j]) continue;

        grid[i][j] = enemyTurn ? 'enemy' : 'player'
        let value = _minimax(depth + 1, grid, !maximizingPlayer, !enemyTurn, alpha, beta)
        grid[i][j] = ''
        
        if (maximizingPlayer) {
          bestVal = Math.max(bestVal, value)
          alpha = Math.max(alpha, bestVal)
        } else {
          bestVal = Math.min(bestVal, value)
          beta = Math.min(beta, bestVal)
        }
        
        if (beta <= alpha)
          break;
      }
    }

    return bestVal;
  }

  const _makeBestMove = (grid, enemyTurn) => {
    let bestMove = {},
      bestVal = -Infinity
    
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (grid[i][j]) continue;
        
        grid[i][j] = enemyTurn ? 'enemy' : 'player'
        let value = _minimax(0, grid, false, !enemyTurn, -Infinity, Infinity)
        grid[i][j] = ''
        
        if (value > bestVal) {
          bestVal = value
          bestMove.i = i
          bestMove.j = j
        }
        
      }
    }

    return bestMove;
  }

  const _nextTurn = (currentPlayer, target) => {
    if (currentPlayer.playerType === 'bot') {
      let { i, j }= _makeBestMove(board, !playerTurn)
      
      let cell = doc.querySelector(`.cell[data-pos="${i}-${j}"]`)
      cell.removeEventListener('click', _play)

      _addMarker(cell)
    } else {
      _addMarker(target)
    }
  }

  const _play = (e) => {
    let cell = e.target
    
    if (playerTurn) {
      _nextTurn(player, cell)

      if (enemy.playerType === 'bot' && _hasEmptyCells(board)) {
        _nextTurn(enemy, cell)
      }
    } else {
      _nextTurn(enemy, cell)
    }

    _checkForWinner()
  }

  const _changePlayerType = (type, name) => {
    let currentPlayer = name === 'player' ? player : enemy

    if (name === 'player')
      initPlayer.type = type
    else
      initEnemy.type = type

    currentPlayer.playerType = type

    newGame()
  }

  const _changePlayerName = (id, name) => {
    if (id === 'player')
      initPlayer.name = player.name = name || 'Player'
    else if (id === 'enemy')
      initEnemy.name = enemy.name = name || 'Enemy'
  }

  const initialize = () => {
    player = Player(initPlayer.name || 'player', initPlayer.type, 'x')
    enemy = Player(initEnemy.name || 'enemy', initEnemy.type, 'o')
    MAX_DEPTH = size === 3 ? 6 : 4
    playerTurn = true
    size = 3    
  }

  const createGameBoard = () => {
    createBoard(size)
    addListeners(newGame, _changePlayerName, _changePlayerType)
  }

  const newGame = () => {
    resetScreen()
    resetBoard()
    initialize()
    createBoard(size)
    addClickEvent(_play)    
    board = getBoard()
  }

  return {
    newGame,
    createGameBoard,
  }
})(document)

Game.createGameBoard()
Game.newGame()