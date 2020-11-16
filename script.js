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

        let name = e.target.value,
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
  let grid = doc.getElementById('grid')

  const addMarker = (target, symbol) => {
    let pos = +target.getAttribute('data-pos')
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

  const createBoard = (size) => {
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        let cell = doc.createElement('div')
        cell.classList.add('cell')
        cell.setAttribute('data-pos', `${i}-${j}`)
        grid.appendChild(cell)
      }
    }
  }

  return {
    createBoard,
    resetBoard,
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
    addClickEvent,
    addMarker,
  } = Board(doc)

  let availableCells, player, enemy, playerTurn, size
  let initPlayer = {
    name: 'Player',
    type: 'human'
  }
  let initEnemy = {
    name: 'Enemy',
    type: 'bot'
  }

  let winCondition = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ]
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

  const _checkConsecutiveBlocks = (x, y, limit, range, direction) => {
    let horizontalncrement = verticalIncrement = rowIncrement = columnIncrement = 0

    const _temp = () => {
      return {
        win: false,
        consecutiveBlocks: 0
      }
    }

    switch (direction) {
      case '|':
        horizontalIncrement = 1
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

    // m is counter for range
    // n is counter for limit
    let player = _temp,
      enemy = _temp
    for (let m = 0; m < range; m++) {
      player = _temp
      enemy = _temp

      //counter for pattern
      let i = x, j = y
      for (let n = 0; n < limit; n++) {
        if (board[i][j] === 'player')
          player.consecutiveBlocks++
        else if (board[i][j] === 'enemy')
          enemy.consecutiveBlocks++

        i += rowIncrement
        j += columnIncrement
      }

      if (player.consecutiveBlocks === limit)
        return 'player'
      else if (enemy.consecutiveBlocks === limit)
        return 'enemy'

      x += verticalIncrement
      y += horizontalncrement
    }

    return;
  }

  const _checkPattern = () => {
    let patterns = size === 3 ? pattern3x3 : pattern5x5
    let limit = size === 3 ? 3 : 4
  
    for (let i = 0; i < patterns.length; i++) {
      let [x, y, direction] = patterns[i]
      let winner = _checkConsecutiveBlocks(x, y, limit, size, direction)

      if (winner) {
        return winner
      }
    }

    return;
  }

  const _checkForPattern = () => {
    let playerWins, enemyWins

    winCondition.forEach(pattern => {
      playerWins = playerWins ? playerWins : pattern.every(x => player.playerMoves.includes(x))
      enemyWins = enemyWins ? enemyWins : pattern.every(x => enemy.playerMoves.includes(x))
    })

    return [playerWins, enemyWins]
  }

  const _checkForWinner = () => {
    let winner = _checkPattern()

    if (winner === 'player') {
      flashScreen(`${player.name} wins!`)
      setTimeout(newGame, 1500)
      return;
    } else if (winner === 'enemy') {
      flashScreen(`${enemy.name} wins!`)
      setTimeout(newGame, 1500)
      return;
    }

    if (availableCells.length === 0 && !winner) {
      flashScreen('It\'s a tie!')
      setTimeout(newGame, 1500)
      return;
    }
  }

  const _addMarker = target => {
    let symbol = playerTurn ? 'x' : 'o',
      pos = addMarker(target, symbol)

    availableCells.splice(availableCells.indexOf(pos), 1)
    playerTurn = !playerTurn
  }

  const _playerTurn = target => {
    let pos = +target.getAttribute('data-pos')
    player.playerMoves.push(pos)
    _addMarker(target)
  }

  const _enemyTurn = target => {
    if (enemy.playerType === 'bot') {
      let pos = Math.floor(Math.random() * (availableCells.length - 1)),
        move = availableCells[pos]

      enemy.playerMoves.push(move)

      let cell = doc.querySelector(`.cell[data-pos="${move}"]`)
      cell.removeEventListener('click', _play)

      _addMarker(cell)
    } else {
      let pos = +target.getAttribute('data-pos')
      enemy.playerMoves.push(pos)
      _addMarker(target)
    }
  }

  const _play = (e) => {
    let cell = e.target

    if (playerTurn) {
      _playerTurn(cell)

      if (enemy.playerType === 'bot' && availableCells.length) {
        _enemyTurn(cell)
      }
    } else {
      _enemyTurn(cell)
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
    availableCells = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    player = Player(initPlayer.name || 'player', initPlayer.type, 'x')
    enemy = Player(initEnemy.name || 'enemy', initEnemy.type, 'o')
    playerTurn = true
  }

  const createGameBoard = () => {
    createBoard()
    addListeners(newGame, _changePlayerName, _changePlayerType)
  }

  const newGame = () => {
    resetScreen()
    resetBoard()
    createBoard(3)
    addClickEvent(_play)
    initialize()
  }

  return {
    newGame,
    createGameBoard
  }
})(document)

Game.createGameBoard()
Game.newGame()