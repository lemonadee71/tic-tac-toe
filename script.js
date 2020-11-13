let grid = document.getElementById('grid')

for (let i = 0; i < 9; i++) {
  let cell = document.createElement('div')
  cell.classList.add('cell')
  cell.style.backgroundColor = 'white'
  grid.appendChild(cell)
}

let cells = Array.from(document.querySelectorAll('.cell'))
cells.forEach(cell => cell.addEventListener('click', () => {
  cell.classList.add('x-marker')
}, { once: true }))

// DOM manipulator
// Player
// Computer

// Create board
// Add event listeners
// Add win condition

// Win condition should be reusable
// We need it for our minimax algorithm