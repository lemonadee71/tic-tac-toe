const Player = (name, type) => {
  let playerMarker = name === 'player' ? 'x' : 'o',
    playerType = type,
    playerMoves = []

  return {
    playerMarker,
    playerType,
    playerMoves
  }
}

const Game = ((doc) => {
  let availableCells = [1, 2, 3, 4, 5, 6, 7, 8, 9]
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

  let player = Player('player', 'human'),
    enemy = Player('enemy', 'bot'),
    playerTurn = true

  const _resetBoard = () => {
    let grid = doc.getElementById('grid')
    while (grid.firstChild) {
      grid.removeChild(grid.lastChild)
    }

    availableCells = [1, 2, 3, 4, 5, 6, 7, 8, 9]
    player = Player('player', 'human')
    enemy = Player('enemy', 'bot')
    playerTurn = true

    createBoard()
  }

  const _checkForWinner = () => {
    let playerWins, enemyWins

    winCondition.forEach(condition => {
      playerWins = condition.every(pos => player.playerMoves.includes(pos))
      enemyWins = condition.every(pos => enemy.playerMoves.includes(pos))

      if (playerWins) {
        alert('Player wins!')
        _resetBoard()
        return;
      } else if (enemyWins) {
        alert('Enemy wins!')
        _resetBoard()
        return;
      }
    })    

    if (availableCells.length === 0) {
      alert('It\'s a tie')
      _resetBoard()
      return;
    }
  }

  const _playerPlay = target => {
    let pos = +target.getAttribute('data-pos')
    player.playerMoves.push(pos)
    _addMarker(target)
  }

  const _enemyPlay = target => {
    if (enemy.playerType === 'bot') {
      let pos = Math.floor(Math.random() * availableCells.length),
        move = availableCells[pos]
      
      enemy.playerMoves.push(move)
      
      let cell = doc.querySelector(`.cell[data-pos="${move}"]`)    
      if (cell.click)
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
        _playerPlay(cell)
        if (enemy.playerType === 'bot' && availableCells.length) {
          _enemyPlay(cell)
        }
      } else {
        _enemyPlay(cell)
      }          
    }

    _checkForWinner()
  }

  const _addMarker = target => {
    let marker = playerTurn ? 'x' : 'o',
      pos = +target.getAttribute('data-pos')
    
    target.classList.add(`${marker}-marker`)    
    availableCells.splice(availableCells.indexOf(pos), 1)
    playerTurn = !playerTurn
  }  
  
  const _addListeners = () => {
    let cells = Array.from(doc.querySelectorAll('.cell'))
    cells.forEach(cell => {
      cell.addEventListener('click', _play, { once: true })
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

    _addListeners()
  }

  return {
    createBoard
  }  
})(document)

Game.createBoard()