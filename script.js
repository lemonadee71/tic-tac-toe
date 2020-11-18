const Player = (name, type, marker) => {
  return {
    name,
    type,
    marker,
  }
}

const App = ((doc) => {
  let screen = doc.getElementById('screen')
  
  const _toggleGridSize = (buttons, callback) => {
    buttons.addEventListener('click', (e) => {
      if (e.target !== buttons && e.target.id !== 'reset') {
        let btn = e.target,
          size = btn.id === 'three' ? 3 : 5

        btn.classList.add('active')

        if (btn === buttons.firstElementChild)
          buttons.lastElementChild.classList.remove('active')
        else if (btn === buttons.lastElementChild)
          buttons.firstElementChild.classList.remove('active')

        callback(size)
      }
    })
  }

  const _togglePlayerType = (buttons, name, callback) => {
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
      sizeBtns = doc.getElementById('toggle-btns'),
      reset = doc.getElementById('reset')

    _resetButton(reset, callback[0])
    _changeName(inputs, callback[1])
    _togglePlayerType(playerBtns, 'player', callback[2])
    _togglePlayerType(enemyBtns, 'enemy', callback[2])
    _toggleGridSize(sizeBtns, callback[3])
  }

  return {
    flashScreen,
    resetScreen,
    addListeners,
  }
})(document)

const Board = ((doc) => {
  let grid = doc.getElementById('grid'),
    gridArray = []

  const getCell = (i, j) => {
    return doc.querySelector(`.cell[data-pos="${i}-${j}"]`)
  }

  const addMarker = (target, symbol) => {
    let pos = target.getAttribute('data-pos').split('-').map(i => +i)
    target.classList.add(`${symbol}-marker`)

    return pos
  }

  const addClickEvent = (callback) => {
    let cells = Array.from(doc.querySelectorAll('.cell'))

    cells.forEach(cell => {
      cell.addEventListener('click', callback, { once: true })
    })
  }

  const removeClickEvent = (target, callback) => {
    target.removeEventListener('click', callback)
  }

  const resetBoard = () => {
    while (grid.firstChild) {
      grid.removeChild(grid.lastChild)
    }
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
    removeClickEvent,
    addMarker,
    getCell,
  }
})(document)

const Game = ((doc) => {
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

  let player, enemy, playerTurn, size, board, MAX_DEPTH

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
    
    let tempPlayer = { consecutiveBlocks: 0 }
      tempEnemy = { consecutiveBlocks: 0 }

    for (let m = 0; m < range; m++) {
      tempPlayer = { consecutiveBlocks: 0 }
      tempEnemy = { consecutiveBlocks: 0 }

      let i = x, j = y
      for (let n = 0; n < limit; n++) {
        if (grid[i][j] === player.marker)
          tempPlayer.consecutiveBlocks++
        else if (grid[i][j] === enemy.marker)
          tempEnemy.consecutiveBlocks++
        
        i += rowIncrement
        j += columnIncrement
      }
      
      if (tempPlayer.consecutiveBlocks === limit)
        return 'player'
      if (tempEnemy.consecutiveBlocks === limit)
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
      App.flashScreen(`${player.name} wins!`)
      setTimeout(newGame, 1500)
    } else if (winner === 'enemy') {
      App.flashScreen(`${enemy.name} wins!`)
      setTimeout(newGame, 1500)
    } 
    
    if (!_hasEmptyCells(board) && !winner) {
      App.flashScreen('It\'s a tie!')
      setTimeout(newGame, 1500)
    }

    return;
  }

  const _addMarker = (currentPlayer, target) => {
    let marker = currentPlayer.marker
    let [x, y] = Board.addMarker(target, marker)    
    board[x][y] = marker
    playerTurn = !playerTurn
  }

  const _evaluate = (depth, grid) => {
    let winner = _checkPattern(grid),
        enemy = playerTurn ? 'enemy' : 'player'
      
      if (!winner) 
        return 0;

      if (winner === enemy)
        return -10 + depth;
      else
        return 10 - depth;
  }

  const _minimax = (depth, grid, maximizingPlayer, enemyTurn, alpha, beta) => {
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

        grid[i][j] = enemyTurn ? enemy.marker : player.marker
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
        
        grid[i][j] = enemyTurn ? enemy.marker : player.marker
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
    if (currentPlayer.type === 'bot') {
      let { i, j }= _makeBestMove(board, !playerTurn),
        cell = Board.getCell(i, j)
      
      Board.removeClickEvent(cell, _play)
      _addMarker(currentPlayer, cell)
    } else {
      _addMarker(currentPlayer, target)
    }
  }

  const _play = (e) => {
    let cell = e.target
    
    if (playerTurn) {
      _nextTurn(player, cell)
      _checkForWinner()
      if (enemy.type === 'bot' && _hasEmptyCells(board)) {
        _nextTurn(enemy, cell)
      }
    } else {
      _nextTurn(enemy, cell)
    }

    _checkForWinner()
  }

  const _changeGridSize = (newSize) => {
    size = newSize
    newGame()
  }

  const _changePlayerType = (type, name) => {
    let currentPlayer = name === 'player' ? player : enemy

    if (name === 'player')
      initPlayer.type = type
    else
      initEnemy.type = type

    currentPlayer.type = type

    newGame()
  }

  const _changePlayerName = (id, name) => {
    if (id === 'player')
      initPlayer.name = player.name = name || 'Player'
    else if (id === 'enemy')
      initEnemy.name = enemy.name = name || 'Enemy'
  }

  const _initialize = () => {
    player = Player(initPlayer.name || 'player', initPlayer.type, 'x')
    enemy = Player(initEnemy.name || 'enemy', initEnemy.type, 'o')
    playerTurn = true
    size = size || 3
    MAX_DEPTH = size === 3 ? 6 : 4
  }

  const createGameBoard = () => {
    Board.createBoard(size)
    App.addListeners(newGame, _changePlayerName, _changePlayerType, _changeGridSize)
  }

  const newGame = () => {
    App.resetScreen()
    Board.resetBoard()
    _initialize()
    Board.createBoard(size)
    Board.addClickEvent(_play)    
    board = Board.getBoard()
  }

  return {
    newGame,
    createGameBoard,
  }
})(document)

Game.createGameBoard()
Game.newGame()