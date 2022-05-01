import { useEffect, useState } from "react";
import blueCandy from "./images/blue-candy.png"
import greenCandy from "./images/green-candy.png"
import orangeCandy from "./images/orange-candy.png"
import purpleCandy from "./images/purple-candy.png"
import redCandy from "./images/red-candy.png"
import yellowCandy from "./images/yellow-candy.png"
import blank from "./images/blank.png"
import ScoreBoard from "./components/scoreBoard";

const width = 8;
const candyColors = [blueCandy, greenCandy, orangeCandy, purpleCandy, redCandy, yellowCandy];

const App = () => {
  const [currentColorArrangement, setCurrentColorArrangement] = useState([])
  const [squareBeingDragged, setSquareBeingDragged] = useState(null)
  const [squareBeingReplaced, setSquareBeingReplaced] = useState(null)
  const [scoreDisplay, setScoreDisplay] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)


  const checkForColumns = () => {
    for (let i = width - 1; i > 2; i--) {
      if (checkColumn(i)) return true
    }
  }

  const checkColumn = (columnNum) => {
    const lastColumn = 64 - 8 * (columnNum - 1) -1
    for (let i = 0; i <= lastColumn; i++) {
      const columnOfN = [i]
      for (let n = 1; n < columnNum; n++) {
        columnOfN.push(i + width * n)
      }
      const decidedColor = currentColorArrangement[i]
      const isBlank = currentColorArrangement[i] === blank
      if (columnOfN.every(square => currentColorArrangement[square] === decidedColor && !isBlank)){
        if (!squareBeingDragged){
          if (gameStarted) setScoreDisplay((score) => score + (columnNum - 2))
          columnOfN.forEach(square => currentColorArrangement[square] = blank)
        }
        return true
      } 
    }
  }

  const checkForRows = () => {
    for (let i = width - 1; i > 2; i--) {
      if (checkRow(i)) return true
    }
  }

  const checkRow = (rowNum) => {
    for (let i = 0; i < 64; i++) {
      const rowOfFour = [i]
      const rowOfN = []
      for (let n = 0; n < rowNum; n++) {
        rowOfN.push(i + n)
      }
      const decidedColor = currentColorArrangement[i]

      const notValid = []
      for (let n = 0; n < width; n++) {
        const lastItemInRow = ((n+1) * 8) - 1
        for (let i = 0; i < rowNum; i++) {
          notValid.push(lastItemInRow - i)
        }
        
      }
      const isBlank = currentColorArrangement[i] === blank

      if (notValid.includes(i)) continue

      if (rowOfN.every(square => currentColorArrangement[square] === decidedColor  && !isBlank)){
        if (!squareBeingDragged){
          if (gameStarted) setScoreDisplay((score) => score + (rowNum - 2))
          rowOfN.forEach(square => currentColorArrangement[square] = blank)
        }
        return true
      } 
    }
  }

  const moveIntoSquareBelow = () => {
    const firstRow = [0,1,2,3,4,5,6,7]

    for (let i = 0; i < 55; i++) {
      const isFirstRow = firstRow.includes(i)
      if (isFirstRow && currentColorArrangement[i] === blank){
        const randomColor = candyColors[Math.floor(Math.random() * candyColors.length)]
        currentColorArrangement[i] = randomColor
      }
      if (currentColorArrangement[i + width] === blank){
        currentColorArrangement[i + width] = currentColorArrangement[i]
        currentColorArrangement[i] = blank
      }
      
    }
  }


  const dragStart = (e) => {
    if (!gameStarted) setGameStarted(true)
    setSquareBeingDragged(e.target)
    console.log('drag start')
  }

  const dragDrop = (e) => {
    setSquareBeingReplaced(e.target)
    console.log('drag drop')
  }

  const dragEnd = () => {
    console.log('drag end')
    const squareBeingReplacedId = parseInt(squareBeingReplaced.getAttribute('data-id'))
    const squareBeingDraggedId = parseInt(squareBeingDragged.getAttribute('data-id'))

    currentColorArrangement[squareBeingReplacedId] = squareBeingDragged.getAttribute('src')
    currentColorArrangement[squareBeingDraggedId] = squareBeingReplaced.getAttribute('src')

    const validMoves = [squareBeingDraggedId -1, squareBeingDraggedId - width, squareBeingDraggedId + 1,  squareBeingDraggedId + width]

    const validMove = validMoves.includes(squareBeingReplacedId)

    const moveHasMatch = checkForColumns() || checkForRows()

    if (squareBeingReplacedId && validMove && moveHasMatch){
      setSquareBeingDragged(null)
      setSquareBeingReplaced(null)
    } else {
      currentColorArrangement[squareBeingReplacedId] = squareBeingReplaced.getAttribute('src')
      currentColorArrangement[squareBeingDraggedId] = squareBeingDragged.getAttribute('src')
      setCurrentColorArrangement([...currentColorArrangement])
    }

    checkForColumns()
    checkForRows()

  }

  const createBoard = () => {
    const randomColorArrangement = []
    for (let i = 0; i < width * width ; i++){
      const randomColor = candyColors[Math.floor(Math.random() * candyColors.length)]
      randomColorArrangement.push(randomColor)
    }
    setCurrentColorArrangement(randomColorArrangement)
  }

  useEffect(() => {
    createBoard()
  }, [])


  useEffect(() => {
    const timer = setInterval(() => {
      checkForColumns()
      checkForRows()
      moveIntoSquareBelow()
      setCurrentColorArrangement([...currentColorArrangement])
    }, 100)
    return () => clearInterval(timer)
  }, [checkForColumns, checkForRows, moveIntoSquareBelow, currentColorArrangement])

  return (
    <div className="app">
      <ScoreBoard score={scoreDisplay}/>
      <div className="game">
        {currentColorArrangement.map((candyColor, index) =>
          <img
            key={index}
            alt={candyColor}
            style={{background: candyColor}}
            src={candyColor}
            data-id={index}
            draggable={true}
            onDragStart={dragStart}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => e.preventDefault()}
            onDragLeave={(e) => e.preventDefault()}
            onDrop={dragDrop}
            onDragEnd={dragEnd}

          />
        )}
      </div>

    </div>
  );
}

export default App;
