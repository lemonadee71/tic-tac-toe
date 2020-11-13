const DEPTH = 5

// Player in this context is our bot
const minimax = (board, player, enemy, depth, winningPattern) => {
  let values = []
  let newPlayer = JSON.parse(JSON.stringify(player)),
    newEnemy = JSON.parse(JSON.stringify(enemy)),
    currentBoard = JSON.parse(JSON.stringify(board))

  depth++
  console.log('DEPTH', depth, board.length)

  if (depth >= DEPTH || board.length === 0) {
    let playerWins, enemyWins
  
    winningPattern.forEach(pattern => {
      playerWins = pattern.every(pos => player.playerMoves.includes(pos))
      enemyWins = pattern.every(pos => enemy.playerMoves.includes(pos))
    })
    if (playerWins)
      return 1
    else if (enemyWins)
      return -1
    else
      return 0
  }

  // first board = current state of the board
  for (let i = 0; i < board.length; i++) {
    currentBoard.splice(i, 1)
    
    if (depth % 2 === 0)
      newPlayer.playerMoves.push(currentBoard[i])
    else 
      newEnemy.playerMoves.push(currentBoard[i])
    
    let value = minimax(currentBoard, newPlayer, newEnemy, depth, winningPattern)
    values.push(value)
  }

  if (depth % 2 === 0) {
    console.log('Minimizing player...', values)
    return Math.min(...values)
  } else {
    console.log('Maximizing player...', values)
    return Math.max(...values)
  }
    
}