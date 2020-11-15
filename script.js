const Player = (name, type, symbol) => {
  return {
    name,
    marker: symbol,
    playerType: type,
    playerMoves: [],
  }
}

const App = ((doc) => {
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
})(document)

const Board = ((doc) => {
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

  const createBoard = () => {
    for (let i = 0; i < 9; i++) {
      let cell = doc.createElement('div')
      cell.classList.add('cell')
      cell.setAttribute('data-pos', `${i}`)
      grid.appendChild(cell)
    }
  }

  return {
    createBoard,
    resetBoard,
    addClickEvent,
    addMarker,
  }
})(document)

const Game = ((doc) => {
  let availableCells, player, enemy, playerTurn
  let initPlayer = {
    name: 'Player',
    type: 'human'
  },
    initEnemy = {
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

  const _checkForPattern = () => {
    let playerWins, enemyWins

    winCondition.forEach(pattern => {
      playerWins = playerWins ? playerWins : pattern.every(x => player.playerMoves.includes(x))
      enemyWins = enemyWins ? enemyWins : pattern.every(x => enemy.playerMoves.includes(x))
    })

    return [playerWins, enemyWins]
  }

  const _checkForWinner = () => {
    let [playerWins, enemyWins] = _checkForPattern()

    if (playerWins) {
      App.flashScreen(`${player.name} wins!`)
      setTimeout(newGame, 1500)
      return;
    } else if (enemyWins) {
      App.flashScreen(`${enemy.name} wins!`)
      setTimeout(newGame, 1500)
      return;
    }

    if (availableCells.length === 0 && !playerWins && !enemyWins) {
      App.flashScreen('It\'s a tie!')
      setTimeout(newGame, 1500)
      return;
    }
  }

  const _addMarker = target => {
    let symbol = playerTurn ? 'x' : 'o',
      pos = Board.addMarker(target, symbol)

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
      cell.removeEventListener('click', play)

      _addMarker(cell)
    } else {
      let pos = +target.getAttribute('data-pos')
      enemy.playerMoves.push(pos)
      _addMarker(target)
    }
  }

  const play = (e) => {
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

  const changePlayerType = (type, name) => {
    let currentPlayer = name === 'player' ? player : enemy

    if (name === 'player')
      initPlayer.type = type
    else
      initEnemy.type = type

    currentPlayer.playerType = type

    newGame()
  }

  const changePlayerName = (id, name) => {
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
    Board.createBoard()
    App.addListeners(newGame, changePlayerName, changePlayerType)
  }

  const newGame = () => {
    App.resetScreen()
    Board.resetBoard()
    Board.createBoard()
    Board.addClickEvent(play)
    initialize()
  }

  return {
    newGame,
    createGameBoard
  }
})(document)

Game.createGameBoard()
Game.newGame()