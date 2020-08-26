// dom elements
const boardSquare = document.querySelectorAll(".board-square");
const startBtn = document.querySelector(".startBtn");
const winningMessage = document.querySelector(".winningMessage");
const computerButton = document.querySelector("#customSwitches");
const playerTwoLabel = document.querySelector("#player2");

//global variable
let playerOne;
let playerTwo;
let playerOneName ="";
let playerTwoName ="";
let computerPlay = false;
let winningSquares = [];
let winner = "";
let gameOver = false; //game does not have winner yet when it first starts

let gameArray = [ //2d array to mirror the gameboard
    [00,01,02],
    [10,11,12],
    [20,21,22]
]; 

//Control the game board appearance
const GameBoard = (function(){

    //makes board responsive so user can click and place a marker
    const setUpBoard = () =>{
        boardSquare.forEach(square =>{
            square.addEventListener('click',e=>{
                addMarker(e.target);
            });
        });
    };

    const addMarker = (square) => {
        if(!square.childNodes.length >0 && !gameOver){
            let currentPlayer = GameSettings.getPlayerTurn();  
            let mark = document.createElement('div');
            mark.textContent = currentPlayer.getSymbol();
            mark.setAttribute('class','marker');
            square.appendChild(mark);
            updateBoardArray(square.id,currentPlayer);
            gameOver = GameSettings.checkWinner();
            GameSettings.changePlayerTurn();

            if(gameOver){
                GameSettings.endGame(winner);
            }
            // if computer play is turned on, computer immediately plays after user
            if(computerPlay && currentPlayer.getSymbol() ==="X" &&!gameOver){
                addMarker(GameSettings.computerTurn());
            }     

        }
    };

    const updateBoardArray = (squareId,currentPlayer) => {
        let i = parseInt(squareId.slice(6,7)); //get i value of block from div id;
        let j = parseInt(squareId.slice(7)); 
        gameArray[i][j] = currentPlayer.getSymbol();
    };

    const checkAvailableMoves = () => {
        let availableMovesArray = [];
        for(let i = 0; i < 3; i++){
            for(let j = 0; j < 3; j++){
                if(gameArray[i][j] !== "X" && gameArray[i][j] !== "O"){
                    availableMovesArray.push([`block-${i}${j}`]);
                }
            }
        }
        return availableMovesArray;
    }

    const getBoard = () => gameArray;

    const clearBoard = () => {
        clearArray();
        boardSquare.forEach(square =>{
            if(square.hasChildNodes()){
                square.removeChild(square.firstChild);
            }
        });
    };
    //clears gameboard array
    const clearArray = () => {
        for(let i = 0; i < 3; i++){
            for(let j = 0; j < 3; j++){
                gameArray[i][j] = `${i}${j}`;
            }
        }

    };
    return{
        setUpBoard,
        getBoard,
        checkAvailableMoves,
        clearBoard
    };
})();

const GameSettings = (() =>{
    const startGame = () => {
        playerOneName = document.querySelector("#player1-name").value;
        playerTwoName = (computerPlay) ? "Computer" : document.querySelector("#player2-name").value;
        playerOne = Player(playerOneName,"X",true);
        playerTwo = Player(playerTwoName,"O",false);
        GameBoard.setUpBoard();
    };

    const changePlayerTurn = () =>{
        playerOne.changeTurn();
        playerTwo.changeTurn();
    };

    const getPlayerTurn = () =>{
        if(playerOne.getTurn()){
            return playerOne;
        }
        return playerTwo;
    }
    
    //returns true when winner is found, false otherwise
    const checkWinner = () =>{
        //right diagonal
        if(gameArray[0][0] === gameArray[1][1] && gameArray[1][1] === gameArray[2][2]){
            winner = gameArray[1][1];
            highlightWinner("rightDiagonal");
        //left diagonal
        }else if(gameArray[0][2] === gameArray[1][1] && gameArray[1][1] === gameArray[2][0]){
            winner = gameArray[1][1];
            highlightWinner("leftDiagonal");
        } 

        for(let i = 0; i < 3; i++){
            //horizontal winner
            if(gameArray[i][0] === gameArray[i][1] && gameArray[i][1] === gameArray[i][2]){
                winner = gameArray[i][0];
                highlightWinner("horizontal",i);
                break;
            //vertical winner
            }else if(gameArray[0][i] === gameArray[1][i] && gameArray[1][i] === gameArray[2][i]){
                winner = gameArray[0][i];
                highlightWinner("vertical",i);
                break;
            }
        }

        if(checkFullBoard(gameArray) && winner ===""){
            winner = "tie";
        }

        if(winner === ""){     //game has not ended yet
            return false;
        }

        return true;
    };

    const checkFullBoard = (board) =>{
        for(let i = 0; i < 3; i++){
            for(let j = 0; j < 3; j++){
                if(board[i][j] !== "X" && board[i][j] !=="O"){
                    return false;
                }
            }
        }
        return true;
    };

    const createBoard = () =>{
        let compBoard= [ //computer board for our minmax algorithm that mirrors current gameboard
            [00,01,02],
            [10,11,12],
            [20,21,22]
        ]; 
        for (let i=0;i<3;i++){
            for (let j=0;j<3;j++){
                if (gameArray[i][j] !== compBoard[i][j]){
                    compBoard[i][j]=gameArray[i][j];
                }  
            }
        }
   
        return compBoard;
    }

    //start AI game
    const toggleComputerGame = () => {
        computerPlay = !computerPlay;
    }
    
    //minimax algorithm to pick best move
    const computerTurn = () =>{
        let availableMoves = GameBoard.checkAvailableMoves();
        let compBoard = createBoard();
        let bestRow = -1;
        let bestCol = -1;
        let bestVal = -1000;

        for(let i = 0; i < 3; i++){
            for(let j = 0; j < 3; j++){
                
                if(compBoard[i][j] != "X" && compBoard[i][j] !="O"){
                    compBoard[i][j] = "O";
                    let moveVal = miniMax(compBoard,0,"X");
                    compBoard[i][j] = "_"; //resets recent placement
                    if(moveVal > bestVal){
                        bestRow = i;
                        bestCol = j;
                        bestVal = moveVal;
                    }

                }
            }
        }
        let bestMove = findBestMove(availableMoves,bestRow,bestCol);
        return document.querySelector(`#${bestMove}`); //returns a block from the gameboard
  
    };

    const findBestMove = (availableMoves,bestRow,bestCol) =>{
        for(let i = 0; i < availableMoves.length; i++){
            if(availableMoves[i][0] === `block-${bestRow}${bestCol}`){
                return availableMoves[i][0];
            }
        }
    }

    const evaluate = (compBoard) =>{
        //check horizontal win
        for(let i = 0; i < 3; i++){
            if(compBoard[i][0] === compBoard[i][1] && compBoard[i][1] === compBoard[i][2]){
                if(compBoard[i][0] === "O"){
                    return +10;
                }else if(compBoard[i][0] ==="X"){
                    return -10;
                }
            }
        }
        //check vertical win
        for(let i = 0; i < 3; i++){
            if(compBoard[0][i] === compBoard[1][i] && compBoard[1][i] === compBoard[2][i]){
                if(compBoard[0][i] === "O"){
                    return +10;
                }else if(compBoard[0][i] ==="X"){
                    return -10;
                }
            }
        }

        //check diagonal win
        if(compBoard[0][0] === compBoard[1][1] && compBoard[1][1] === compBoard[2][2]){
            if(compBoard[0][0] ==="O"){
                return +10;
            }else if(compBoard[0][0] ==="X"){
                return -10;
            }
        }

        if(compBoard[0][2] === compBoard[1][1] && compBoard[1][1] === compBoard[2][0]){
            if(compBoard[0][2] ==="O"){
                return +10;
            }else if(compBoard[0][2] ==="X"){
                return -10;
            }
        }
        //if tie
        return 0;
    };

    //algorithm for unbeatable AI
    const miniMax = (compBoard,depth,player) =>{
        let score = evaluate(compBoard);

        if(score === 10){ return score;}
        if(score === -10) {return score;}
        if(checkFullBoard(compBoard)) {return 0;}

        if(player === "O"){        
            let best = -1000;
            for(let i = 0; i < 3; i++){
                for(let j = 0; j < 3; j++){
                    if(compBoard[i][j] !== "X" && compBoard[i][j] !== "O"){ // might be ||
                        compBoard[i][j] = "O";
                        best = Math.max(best,miniMax(compBoard, depth+1,"X"));
                        compBoard[i][j] = "_";
                    }
                }
            }
            return best;
        }else{
            let best = 1000;

            for(let i = 0; i < 3; i++){
                for(let j = 0; j < 3; j++){
                    if(compBoard[i][j] !== "X" && compBoard[i][j] !== "O"){ // might be ||
                        compBoard[i][j] = "X";
                        best = Math.min(best,miniMax(compBoard, depth+1,"O"));
                        compBoard[i][j] = "_";
                    }
                }
            }
            return best;
        }
    };

    const endGame = (winner) => {
        displayWinner(winner);
        let playAgainBtn = document.createElement('button');
        playAgainBtn.textContent = "Play Again";
        playAgainBtn.className = "btn btn-primary";
        winningMessage.appendChild(playAgainBtn);
        playAgainBtn.addEventListener('click',()=>{
            resetGame();
        });   
    };

    const displayWinner = (winner) =>{
        switch(winner){
            case "X":
                winner = playerOne.getName();
                break;
            case "O":
                winner = playerTwo.getName();
                break;
            case "tie":
                winner = "tie";
                break;
        }

        let winnerMsg = document.createElement('div');
        winningMessage.appendChild(winnerMsg);
        if(winner === "tie"){
            winnerMsg.textContent = `The game ended in a tie!`;
        }else{
            winnerMsg.textContent = `The winner is ${winner}!`;
        }
    };

    const highlightWinner = (winnerType,i) => {
        switch (winnerType){
            case "rightDiagonal":
                winningSquares.push(["00"],["11"],["22"]);
                break;
            case "leftDiagonal":
                winningSquares.push(["02"],["11"],["20"]);
                break;
            case "horizontal":
                winningSquares.push([i+"0"],[i+"1"],[i+"2"]);
                break;
            case "vertical":
                winningSquares.push(["0"+i],["1"+i],["2"+i]);
                break;
        }
        winningSquares.forEach(square =>{
            let winSquare = document.querySelector(`#block-${square}`);
            winSquare.classList.add('highlightWinners');
        })
    };

    const clearHighlight = () =>{
        winningSquares.forEach(square =>{
            let winSquare = document.querySelector(`#block-${square}`);
            winSquare.classList.remove('highlightWinners');
        })
    }

    const clearWinMsg = () =>{
        winningMessage.querySelectorAll('*').forEach(n => n.remove());
    }

    const resetGame = () =>{
        winner = "";
        gameOver = false;
        GameBoard.clearBoard();
        clearHighlight();
        winningSquares = [];
        clearWinMsg();
        startGame();
    };

    return {
        startGame,
        endGame,
        getPlayerTurn,
        changePlayerTurn,
        toggleComputerGame,
        computerTurn,
        checkWinner,
        resetGame
    }
})();

//Player factory function
const Player = (name,symbol,turn) =>{
    const getName = () => name;
    const getSymbol = () => symbol;
    const getTurn = () => turn;
    const changeTurn = ()=>{
        if(turn){
            turn = false;
        }
        else if(!turn){
            turn = true;
        }
    }

    return{getName,getSymbol,getTurn,changeTurn}
};

//Starts game when startbtn clicked
startBtn.addEventListener('click',e =>{
    GameSettings.startGame();
})

//Starts AI Game
computerButton.addEventListener('click',e=>{
    GameSettings.toggleComputerGame();
    GameSettings.resetGame();
    if(computerButton.checked){
        playerTwoLabel.style.display = "none";
    }
    else{
        playerTwoLabel.style.display = "block";
    }
});

