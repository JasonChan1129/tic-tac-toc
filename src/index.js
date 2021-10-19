import React from 'react';
import ReactDOM from 'react-dom';
import Button from 'react-bootstrap/Button';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';

class Square extends React.Component {
	render() {
		return (
			<button className="button" style={this.props.style} onClick={() => this.props.onClick()}>
				{this.props.value}
			</button>
		);
	}
}

class Board extends React.Component {
	renderSquare(i) {
		const winnerObj = calculateWinner(this.props.squares);
		// if there is a winner and that square[i] element is part of the 3 blocks that bring victory, highlight the square with green
		if (winnerObj) {
			if (winnerObj.line.filter(x => x === i).length === 1) {
				return (
					<Square
						value={this.props.squares[i]}
						style={{ color: 'green' }}
						onClick={() => this.props.onClick(i)}
					/>
				);
			}
		}
		return <Square value={this.props.squares[i]} onClick={() => this.props.onClick(i)} />;
	}

	render() {
		// Use 2 loops to create square elements
		// * Give every jsx element in a list a unique key * A JSX element must be wrap in {} and must return only one html element
		let boardSquares = [];
		for (let row = 0; row < 3; row++) {
			let boardRow = [];
			for (let col = 0; col < 3; col++) {
				boardRow.push(
					<div className="square" key={'square' + (row * 3 + col)}>
						{this.renderSquare(row * 3 + col)}
					</div>
				);
			}
			boardSquares.push(
				<div className="board-row" key={'row-' + row}>
					{boardRow}
				</div>
			);
		}

		return (
			<div className={this.props.modeChecked ? 'container-gb-playing' : 'container-gb-start'}>
				<div className={this.props.modeChecked ? 'game-board-playing' : 'game-board-start'}>
					{boardSquares}
				</div>
			</div>
		);
	}
}

class Game extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			history: [
				{
					squares: Array(9).fill(null),
				},
			],
			stepNumber: 0,
			xIsNext: true,
			modeChecked: false,
			mode: '',
		};
	}

	// Update the state to the chosen mode
	chooseMode(event) {
		this.setState({
			modeChecked: true,
			mode: event.target.value,
		});
	}

	// Computer make moves
	// Since this function was passed as a callback function in setState, therefore the state has already been changed.
	computerTurn() {
		const history = this.state.history.slice(0, this.state.stepNumber + 1);
		const current = history[history.length - 1];
		// Copy the squares array
		const squares = current.squares.slice();

		if (calculateWinner(squares)) {
			return;
		}

		// Return an array of empty spots left on the gameboard
		const empty = [];
		squares.reduce((acc, cur, index) => {
			if (cur === null) {
				empty.push(index);
			}
			return acc;
		}, 0);
		// Randomly pick a index from the 'empty' array
		const min = Math.ceil(0);
		const max = Math.floor(empty.length);
		const randomIndex = Math.floor(Math.random() * (max - min) + min);
		const randomSquare = empty[randomIndex];
		// Assign 'O' to that randomly chosen spot
		squares[randomSquare] = 'O';

		this.setState({
			history: history.concat([
				{
					squares: squares,
				},
			]),
			stepNumber: history.length,
			xIsNext: true,
		});
	}

	// handle click on one of the nine squares
	handleClick(i) {
		const history = this.state.history.slice(0, this.state.stepNumber + 1);
		const current = history[history.length - 1];
		const mode = this.state.mode;

		// Copy the squares array
		const squares = current.squares.slice();
		// If there is a winner or that square is already selected, then return.
		if (calculateWinner(squares) || squares[i]) {
			return;
		}

		// Check if the mode is single or two
		if (mode === 'single') {
			if (this.state.xIsNext) {
				squares[i] = 'X';
				this.setState(
					{
						history: history.concat([
							{
								squares: squares,
							},
						]),
						stepNumber: history.length,
						xIsNext: false,
					},
					() => {
						setTimeout(() => {
							this.computerTurn();
						}, 1000);
					}
				);
			}
		} else if (mode === 'two') {
			squares[i] = this.state.xIsNext ? 'X' : 'O';
			this.setState({
				history: history.concat([
					{
						squares: squares,
					},
				]),
				stepNumber: history.length,
				xIsNext: !this.state.xIsNext,
			});
		}
	}

	// handle the time travel function
	jumpTo(step) {
		this.setState({
			stepNumber: step,
			xIsNext: step % 2 === 0,
		});
	}

	// reset all of the state
	playAgain() {
		this.setState({
			history: [
				{
					squares: Array(9).fill(null),
				},
			],
			stepNumber: 0,
			xIsNext: true,
			modeChecked: false,
		});
	}

	render() {
		// Variable for hiding or showing the game-info elements
		const showDisplay = {
			display: 'flex',
		};

		const hideDisplay = {
			display: 'none',
		};

		// create the time travel buttons based on the current timesteps
		const history = this.state.history;
		const current = history[this.state.stepNumber];

		const moves = history.map((step, move) => {
			const desc = move ? 'Go to move #' + move : 'Go to game start';
			return (
				<li key={move}>
					<Button variant="outline-primary" onClick={() => this.jumpTo(move)}>
						{desc}
					</Button>
				</li>
			);
		});

		// handle the status bar
		let status;
		let remainingBox = current.squares.filter(x => x == null).length;
		if (calculateWinner(current.squares)) {
			const winner = calculateWinner(current.squares).winner;
			status = 'The winner is: ' + winner + '!';
		} else {
			// there is no null in the squares array, but winner is not yet declared.
			if (remainingBox === 0) {
				status = 'Tie!';
			} else {
				status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
			}
		}

		let modeChecked = this.state.modeChecked;

		return (
			<div className={modeChecked ? 'game-playing' : 'game-start'}>
				<Board
					squares={current.squares}
					onClick={i => this.handleClick(i)}
					modeChecked={modeChecked}
				/>
				<div className={modeChecked ? 'game-info-playing' : 'game-info-start'}>
					<div className="mode" style={modeChecked ? hideDisplay : showDisplay}>
						<Button
							value="single"
							bsPrefix="btn btn-outline-primary buttonMode"
							onClick={event => this.chooseMode(event)}
						>
							1 player
						</Button>
						<Button
							value="two"
							bsPrefix="btn btn-outline-primary buttonMode"
							onClick={event => this.chooseMode(event)}
						>
							2 player
						</Button>
					</div>
					<div className="status" style={modeChecked ? showDisplay : hideDisplay}>
						<header>{status}</header>
					</div>
					<div className="game-history" style={modeChecked ? showDisplay : hideDisplay}>
						<header>Game history</header>
					</div>
					<div className="history" style={modeChecked ? showDisplay : hideDisplay}>
						<ol>
							{moves}
							<Button variant="outline-success" onClick={() => this.playAgain()}>
								Play again!
							</Button>
						</ol>
					</div>
				</div>
			</div>
		);
	}
}

ReactDOM.render(<Game />, document.getElementById('root'));

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
			return { winner: squares[a], line: lines[i] };
		}
	}
	return null;
}
