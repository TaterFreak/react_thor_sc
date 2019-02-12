pragma solidity ^0.5.0;

contract Bet {

	uint constant STATUS_WIN = 1;
	uint constant STATUS_LOSE = 2;
	uint constant STATUS_TIE = 3;
	uint constant STATUS_PENDING = 4;
 
	uint constant STATUS_NOT_STARTED = 1;
	uint constant STATUS_STARTED = 2;
	uint constant STATUS_FINISHED = 3;

	uint constant STATUS_ERROR = 4;

	struct Better {
		uint guess;
		address payable addr;
		uint status;
	}

	struct Game {
		uint256 betAmount;
		uint outcome;
		uint status;
		Better originator;
		Better taker;
	}

	//game
	Game game;

	//callback
	function() external payable {}

	function createBet(uint _guess) public payable {
		game = Game(msg.value, 0, STATUS_STARTED, Better(_guess, msg.sender, STATUS_PENDING), Better(0, msg.sender, STATUS_NOT_STARTED));
		game.originator = Better(_guess, msg.sender, STATUS_PENDING);
	}

	function takeBet(uint _guess) public payable {
		require(msg.value == game.betAmount);
		game.taker = Better(_guess, msg.sender, STATUS_PENDING);
		generateBetOutcome();
	}

	function payout() public payable {
		checkPermissions(msg.sender);

		if (game.originator.status == STATUS_TIE && game.taker.status == STATUS_TIE) {
			game.originator.addr.transfer(game.betAmount);
			game.taker.addr.transfer(game.betAmount);
		} else {
			if (game.originator.status == STATUS_WIN) {
				game.originator.addr.transfer(game.betAmount*2);
			} else if (game.taker.status == STATUS_WIN) {
				game.taker.addr.transfer(game.betAmount*2);
			} else {
				game.originator.addr.transfer(game.betAmount);
				game.taker.addr.transfer(game.betAmount);
			}
		}
	}

	function checkPermissions(address sender) view private {
		require(sender == game.originator.addr || sender == game.taker.addr);
	}

	function getBetAmount() public view returns (uint) {
		checkPermissions(msg.sender);
		return game.betAmount;
	}

	function getOriginatorGuess() public view returns (uint) {
		checkPermissions(msg.sender);
		return game.originator.guess;
	}

	function getTakerGuess() public view returns (uint) {
		checkPermissions(msg.sender);
		return game.taker.guess;
	}

	function getPot() public view returns (uint256) {
		checkPermissions(msg.sender);
		return address(this).balance;
	}

	function generateBetOutcome() private {
		game.outcome = uint(10);
		//game.outcome = uint(blockhash(block.number - 1))%10 + 1;
		game.status = STATUS_FINISHED;

		if (game.originator.guess == game.taker.guess) {
			game.originator.status = STATUS_TIE;
			game.taker.status = STATUS_TIE;
		} else if (game.originator.guess > game.outcome && game.taker.guess > game.outcome) {
			game.originator.status = STATUS_TIE;
			game.taker.status = STATUS_TIE;
		} else  {
			if ((game.outcome - game.originator.guess) < (game.outcome - game.taker.guess)) {
				game.originator.status = STATUS_WIN;
				game.taker.status = STATUS_LOSE;
			} else if ((game.outcome - game.taker.guess) < (game.outcome - game.originator.guess)) {
				game.originator.status = STATUS_LOSE;
				game.taker.status = STATUS_WIN;
			} else {
				game.originator.status = STATUS_ERROR;
				game.taker.status = STATUS_ERROR;
				game.status = STATUS_ERROR;
			}
		}
	}

	//returns - [<description>, 'originator', <originator status>, 'taker', <taker status>]
	function getBetOutcome() public view returns (string memory description, string memory originatorKey, uint originatorStatus, string memory takerKey, uint takerStatus) {
		if (game.originator.status == STATUS_TIE || game.taker.status == STATUS_TIE) {
			description = "both bets were the same or over the number, split the pot";
		} else {
			if (game.originator.status == STATUS_WIN) {
				description = "Originator wins";
			} else if (game.taker.status == STATUS_WIN) {
				description = "Taker wins";
			} else {
				description = "Unknown outcome";
			}
		}
		originatorKey = "originator";
		originatorStatus = game.originator.status;
		takerKey = "taker";
		takerStatus = game.taker.status;
	}
}