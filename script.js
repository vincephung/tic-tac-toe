// dom elements
const boardSquare = document.querySelectorAll(".board-square");
const startBtn = document.querySelector(".startBtn");
const winningMessage = document.querySelector(".winningMessage");
//global variable
let playerOneName ="";
let playerTwoName ="";
let winningSquares = [];

//Control the game board appearance
const GameBoard = (function(){
    let winner = false; // game does not have winner yet when it first starts

    let gameArray = [ //2d array to mirror the gameboard
        [00,01,02],
        [10,11,12],
        [20,21,22]
    ]; 

    //makes board responsive so user can click and place a marker
    const setUpBoard = () =>{
        boardSquare.forEach(square =>{
            square.addEventListener('click',e=>{
                addMarker(e.target);
            });
        });
    };

    const addMarker = (square) => {
        if(!square.childNodes.length >0 && !winner){
            let symbol = GameSettings.getSymbol();
            let mark = document.createElement('div');
            mark.textContent = symbol;
            mark.setAttribute('class','marker');
            square.appendChild(mark);
            updateBoardArray(square.id);
            winner = GameSettings.checkWinner(gameArray);
            GameSettings.changePlayerTurn();
        }
    };

    const updateBoardArray = (squareId) => {
        let i = parseInt(squareId.slice(6,7)); //get i value of block from div id;
        let j = parseInt(squareId.slice(7)); 
        gameArray[i][j] = GameSettings.getSymbol();
    };

    const clearBoard = (gameArray) => {
        clearArray(gameArray);
        boardSquare.forEach(square =>{
            if(square.hasChildNodes()){
                square.removeChild(square.firstChild);
            }
        });
    };

    const clearArray = (gameArray) => {
        winner = false;
        for(let i = 0; i < 3; i++){
            for(let j = 0; j < 3; j++){
                gameArray[i][j] = `${i}${j}`;
            }
        }

    };
    return{
        setUpBoard,
        clearBoard
    };
})();

const GameSettings = (() =>{
    let symbol = "X"; //player one X goes first
    let winner = "";

    const startGame = () => {
        playerOneName = document.querySelector("#player1-name").value;
        playerTwoName = document.querySelector("#player2-name").value;
        let playerOne = Player(playerOneName,"X");
        let playerTwo = Player(playerTwoName,"O");
        GameBoard.setUpBoard(symbol);

    };

    const getSymbol = () => symbol;
    const changePlayerTurn = () =>{
        symbol = (symbol === "X") ? symbol = "O" : symbol = "X";
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

    const checkWinner = (gameArray) =>{
        let winner = "";

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

        if(checkFullBoard(gameArray)){
            winner = "tie";
        }

        if(winner === ""){     
            return false;
        }

        endGame(winner,gameArray);
        return true;
    };

    const checkFullBoard = (gameArray) =>{
        for(let i = 0; i < 3; i++){
            for(let j = 0; j < 3; j++){
                if(gameArray[i][j] !== "X" && gameArray[i][j] !=="O"){
                    return false;
                }
            }
        }
        return true;
    };

    const endGame = (winner,gameArray) => {
        displayWinner(winner);
        let playAgainBtn = document.createElement('button');
        playAgainBtn.textContent = "Play Again";
        playAgainBtn.className = "btn btn-primary";
        winningMessage.appendChild(playAgainBtn);
        playAgainBtn.addEventListener('click',()=>{
        resetGame(gameArray);
        });   
    };

    const displayWinner = (winner) =>{
        switch(winner){
            case "X":
                winner = "Player 1";
                break;
            case "O":
                winner = "Player 2";
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

    const clearWinMsg = () =>{
        winningMessage.querySelectorAll('*').forEach(n => n.remove());
    }

    const resetGame = (gameArray) =>{
        GameBoard.clearBoard(gameArray);
        clearHighlight();
        winningSquares = [];
        clearWinMsg();
        startGame();
    };

    return {
        startGame,
        getSymbol,
        changePlayerTurn,
        checkWinner
    }
})();

//Player factory function
const Player = (name,symbol) =>{
    return{name,symbol}
};

//when start button is clicked start the game
startBtn.addEventListener('click',e =>{
    GameSettings.startGame();
})

