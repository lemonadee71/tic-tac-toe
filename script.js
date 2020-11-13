const Player = (name, type, symbol) => {
  return {
    name,
    marker: symbol,
    playerType: type,
    playerMoves: [],
  }
}

const Board = ((doc) => {
  const addNames = () => {
    let inputs = Array.from(doc.querySelectorAll('input'))
    inputs.forEach(input => {
      input.addEventListener('dblclick', () => {
        input.removeAttribute('readonly')
      })
    })
  }

  const resetBoard = () => {
    let grid = doc.getElementById('grid')
    while (grid.firstChild) {
      grid.removeChild(grid.lastChild)
    }
  }

  const addListeners = (func) => {
    let cells = Array.from(doc.querySelectorAll('.cell'))
    cells.forEach(cell => {
      cell.addEventListener('click', func, { once: true })
    })
  }  

  const createBoard = () => { 
    let grid = doc.getElementById('grid')

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
    addListeners,
    addNames,
  }
})(document)

const Game = ((doc) => {
  let availableCells, player, enemy, playerTurn
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
    let [playerWins, enemyWins] = _checkForPattern(),
      screen = document.getElementById('screen')    
    
    if (playerWins) {
      screen.textContent = `${player.name} wins!`
      setTimeout(newGame, 1500)  
      return;
    } else if (enemyWins) {
      screen.textContent = `${enemy.name} wins!`
      setTimeout(newGame, 1500)
      return;
    }
    
    if (availableCells.length === 0 && !playerWins && !enemyWins) {
      screen.textContent = 'It\'s a tie!'
      setTimeout(newGame, 1500)
      return;
    }    
  }

  const _addMarker = target => {
    let symbol = playerTurn ? 'x' : 'o',
      pos = +target.getAttribute('data-pos')
    
    target.classList.add(`${symbol}-marker`)    
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

      //let minimaxChoice = minimax([...availableCells], enemy, player, 0, winCondition)
      //console.log('Final choice:', minimaxChoice)
      
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

    if (cell !== grid) {
      if (playerTurn) {
        _playerTurn(cell)
        _checkForWinner()

        if (enemy.playerType === 'bot' && availableCells.length) {
          _enemyTurn(cell)
          _checkForWinner()
        }
      } else {
        _enemyTurn(cell)
        _checkForWinner()
      }          
    }    
  }

  const initialize = () => {
    availableCells = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    player = Player('player', 'human', 'x')
    enemy = Player('enemy', 'bot', 'o')
    playerTurn = true

    let screen = document.getElementById('screen')
    screen.textContent = 'Tic Tac Toe'
  }

  const newGame = () => {
    Board.resetBoard()
    Board.createBoard()
    Board.addListeners(_play)
    Board.addNames()
    initialize()
  }

  return {
    newGame    
  }  
})(document)

Game.newGame()