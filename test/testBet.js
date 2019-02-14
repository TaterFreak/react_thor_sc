const Bet = artifacts.require("./Bet.sol");

const betAmountInVet = 6666666666666666000; //figure out how to get decent values in thor
const wrongBetAmountInVet = 50;

contract("Bet", accounts => {
	const betOriginator = accounts[8];
	const betTaker = accounts[9];
	const badActor = accounts[10];
	const originatorGuess = 11;
	const takerGuess = 1;
 
	const originatorBalanceBeforeBet = web3.eth.getBalance(betOriginator);
	const takerBalanceBeforeBet = web3.eth.getBalance(betTaker);

	it('We should be able to start a bet by setting a guess and sending the bet amount that the contract was initiated with', function() {
		return Bet.deployed().then(function(instance) {
			return instance.createBet.sendTransaction(originatorGuess , {
				from: betOriginator,
				value: betAmountInVet,
			})
			.then(tx => {
				assert.notEqual(tx, "", "We should get a transaction hash")
			})
		});
	});

	it('The originating bet amount in the contract should match the passed in values', function() {
		return Bet.deployed().then(function(instance) {
			return instance.getBetAmount({
				from: betOriginator,
			})
			.then(betAmount => {
				assert.equal(betAmount, betAmountInVet, "Bet amounts don't match");
			});
		});
	});

	it('The originating bet guess in the contract should match the past in value', function() {
		return Bet.deployed().then(function(instance) {
			return instance.getOriginatorGuess({
				from: betOriginator,
			})
			.then(betGuess => {
				assert.equal(betGuess, originatorGuess, "Bet guesses don't match");
			});
		});
	});

	it('We should be able to take a bet by setting a guess and sending the bet amount that the contract was initialized with', function() {
		return Bet.deployed().then(function(instance) {
			return instance.takeBet.sendTransaction(takerGuess, {
				from: betTaker,
				value: betAmountInVet,
			})
			.then(tx => {
				assert.notEqual(tx, "", "We should get a transaction hash");
			});
		});
	});

	it('Taking the bet should fail if the bet amount does not equal the bet amount that the contract was initialized with', function() {
		return Bet.deployed().then(function(instance) {
			return instance.takeBet.sendTransaction(takerGuess, {
				from: betTaker,
				value: wrongBetAmountInVet,
			})
			.catch(e => {
				assert.isDefined(e, "we should get an error");
			});
		});
	});

	it('The taker bet guess in the contract should match the past in value', function() {
		return Bet.deployed().then(function(instance) {
			return instance.getTakerGuess({
				from: betTaker,
			})
			.then(guess => {
				assert.equal(guess, takerGuess, "Bet guesses don't match");
			});
		});
	});

	it('The contract balance should reflect the bets', function() {
		return Bet.deployed().then(function(instance) {
			return instance.getPot({
				from: betTaker
			})
			.then(balance => {
				assert.equal(
					balance.toString(),
					(betAmountInVet * 2).toString(),
					"contract balance should equal the bet amounts"
				);
			});
		});
	});

	it('the taker or originator should be able to call the payout to transfert winnigs', function() {
		return Bet.deployed().then(function(instance) {
			return instance.payout({
				from: betTaker
			})
			.then(tx => {
				assert.notEqual(tx.tx, "", "We should have a transaction hash");
			});
		});
	});

	it('originator and Taker balances should reflect bet outcome', function() {
		return Bet.deployed().then(function(instance) {
			return instance.getBetOutcome({
				from: betTaker
			})
			.then(async(outcome) => {
				assert.notEqual(outcome[0], "", "Bet outcome description should not be empty");
				assert.notEqual(outcome[2], "", "Bet originator status should not be empty");
				assert.notEqual(outcome[4], "", "Bet taker status should not be empty");

				const originatorBalanceAfterPayout = await web3.eth.getBalance(betOriginator);
				const takerBalanceAfterPayout = await web3.eth.getBalance(betTaker);

				console.log(JSON.stringify(outcome));

				if (outcome[2].toString() === "1") {
					let gain = await originatorBalanceBeforeBet
						.then(res => {
							console.log("originator gain: " + (originatorBalanceAfterPayout - res));
							return originatorBalanceAfterPayout - res;
						})
						.then(res => {
							return res / betAmountInVet;
						})
						.then(res => {
							return res > 0.9;
						})

					assert.equal(
						gain,
						true,
						"Balance Gain after payout for a winning bet should be within 10% of bet amount"
					);
				} else if (outcome[4].toString() === "1") {
					let gain = await takerBalanceBeforeBet
						.then(res => {
							console.log('taker gain: ' + (takerBalanceAfterPayout - res));
							return takerBalanceAfterPayout - res;
						})
						.then(res => {
							return res / betAmountInVet;
						})
						.then(res => {
							return res > 0.9;
						})

					assert.equal(
						gain,
						true,
						"Balance gain after payout for a winning bet should be within 10% of bet amount"
					);
				} else {
					let takerDelta = await takerBalanceBeforeBet
						.then(res => {
							return takerBalanceAfterPayout - res;
						})
						.then(res => {
							return res < 0.1;
						})

					let originatorDelta = await originatorBalanceBeforeBet
						.then(res => {
							return originatorBalanceAfterPayout - res;
						})
						.then(res => {
							return res < 0.1;
						});

					assert.equal(
						originatorDelta && takerDelta,
						true,
						"Balance after payout for a tied bet should be within 1% of original balance"
					);
				};
			});
		});
	});

	it('only the taker or originator shoud be able to call the payout function', function() {
		return Bet.deployed().then(function(instance) {
			return instance.payout({
				from: badActor
			})
			.catch(e => {
				assert.isDefined(e, "Only originator and taker can access payout");
			});
		});
	});

	it('only the taker or originator shoud be able to call the getBetAmount function', function() {
		return Bet.deployed().then(function(instance) {
			return instance.getBetAmount({
				from: badActor
			})
			.catch(e => {
				assert.isDefined(e, "Only originator and taker can access getBetAmount");
			});
		});
	});

	it('only the taker or originator shoud be able to call the getOriginatorGuess function', function() {
		return Bet.deployed().then(function(instance) {
			return instance.getOriginatorGuess({
				from: badActor
			})
			.catch(e => {
				assert.isDefined(e, "Only originator and taker can access getOriginatorGuess");
			});
		});
	});

	it('only the taker or originator shoud be able to call the getTakerGuess function', function() {
		return Bet.deployed().then(function(instance) {
			return instance.getTakerGuess({
				from: badActor
			})
			.catch(e => {
				assert.isDefined(e, "Only originator and taker can access getTakerGuess");
			});
		});
	});

	it('only the taker or originator shoud be able to call the getPot function', function() {
		return Bet.deployed().then(function(instance) {
			return instance.getPot({
				from: badActor
			})
			.catch(e => {
				assert.isDefined(e, "Only originator and taker can access getPot");
			});
		});
	});

	it('only the taker or originator shoud be able to call the getBetAmount function', function() {
		return Bet.deployed().then(function(instance) {
			return instance.getBetAmount({
				from: badActor
			})
			.catch(e => {
				assert.isDefined(e, "Only originator and taker can access getBetAmount");
			});
		});
	});
});

