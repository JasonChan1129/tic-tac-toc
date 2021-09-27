import React from "react";
import ReactDOM from 'react-dom';
import Button from 'react-bootstrap/Button';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

class Square extends React.Component {
    render() {
        return (
            <button className='button' style={this.props.style} onClick={() => this.props.onClick()}>
                {this.props.value}
            </button>
        )
    }
}

class Board extends React.Component {   
    renderSquare(i) {
        const winnerObj = calculateWinner(this.props.squares);
        // if there is a winner and that square[i] element is part of the 3 blocks that bring victory, highlight the square with green
        if (winnerObj) {
            if (winnerObj.line.filter(x => x === i).length === 1) {
                return (
                    <Square value={this.props.squares[i]} style={{color: "green"}} onClick={() => this.props.onClick(i)}/>
                )
            }
        }
        return (
            <Square value={this.props.squares[i]} onClick={() => this.props.onClick(i)}/>
        )       
    }

    render() {
        // Use 2 loops to create square elements
        // * Give every jsx element in a list a unique key * A JSX element must be wrap in {} and must return only one html element
        let boardSquares = [];
        for (let row = 0; row < 3; row++) {
            let boardRow = [];
            for (let col = 0; col < 3; col++) {
                boardRow.push(<div className='square' key={'square' + (row * 3 + col)}>{this.renderSquare(row * 3 + col)}</div>)
            }
            boardSquares.push(<div className="board-row" key={'row-' + row}>{boardRow}</div>)
        }

        return (
            <div className='container-gb'>
                <div className='game-board'>
                    {boardSquares}
                </div>
            </div>
        )
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props) 
        this.state = {
            history: [{
                squares: Array(9).fill(null),
            }],
            stepNumber: 0,
            xIsNext: true,
        }
    }

    handleClick(i){
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        // Copy the squares array
        const squares = current.squares.slice();
        // If there is a winner or that square is already selected, then return.
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState(
            {
                history: history.concat([{
                    squares: squares,
                  }]),
                stepNumber: history.length,
                xIsNext: !this.state.xIsNext,
            }
        )
    }

    jumpTo(step) {
        this.setState(
            {
                stepNumber: step,
                xIsNext: (step % 2 === 0),
            }
        )
    }

    playAgain() {
        this.setState({
            history: [{
                squares: Array(9).fill(null),
            }],
            stepNumber: 0,
            xIsNext: true,
        })
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];

        const moves = history.map((step, move) => {
            const desc = move ? 'Go to move #' + move : 'Go to game start';
            return (
                <li key={move}>
                    <Button variant="outline-primary" onClick={() => this.jumpTo(move)}>{desc}</Button>
                </li>
            )
        })

        let status;
        let remainingBox = current.squares.filter(x => x == null).length
        if (calculateWinner(current.squares)) {
            const winner = calculateWinner(current.squares).winner;
            status = 'The winner is: ' + winner + '!';
        }
        else {
            // there is no null in the squares array, but winner is not yet declared.
            if (remainingBox === 0) {
                status = 'Tie!'
            }
            else {
                status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O')
            }
        }

        return (
            <div className='game'>
                <Board squares={current.squares} onClick = {(i) => this.handleClick(i)}/>
                <div className='game-info'>
                    <div className='status'>
                        <header>{status}</header>
                    </div>
                    <div className='game-history'>
                        <header>Game history</header>
                    </div>
                    <div className='history'>
                        <ol>{moves}</ol>
                        <ol><Button variant="outline-success" onClick = {() => this.playAgain()}>Play again!</Button></ol>
                    </div>
                </div>
            </div>
        )
    }
}

ReactDOM.render(
    <Game />,
    document.getElementById('root')
  );

// function to check if there is a winner.
function calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return {winner: squares[a], line: lines[i]}
      }
    }
    return null;
  }