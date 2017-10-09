pragma solidity ^0.4.0;


contract Program {

	address public owner;

	mapping (address => uint256) public balances;

	event LogDeposit(address sender, uint amount);
	event LogWithdrawal(address receiver, uint amount);
	event LogTransfer(address sender, address to, uint amount);

	function Program() public {
		owner = msg.sender;
	}

	function deposit() public payable returns(bool success) {
		balances[msg.sender] += msg.value;
		LogDeposit(msg.sender, msg.value);
		return true;
	}

	function balance(address account) external returns(uint256 balance) {
		if (balances[account] > 0) {
			return balances[account];
		} else {
			return 0;
		}
	}

	function withdraw(uint value) external returns(bool success) {
		require(balances[msg.sender] > value);
		balances[msg.sender] -= value;
		msg.sender.transfer(value);
		LogWithdrawal(msg.sender, value);
		return true;
	}

	function transfer(address to, uint256 value) public returns(bool success) {
		require(balances[msg.sender] > value);
		balances[msg.sender] -= value;
		balances[to] = value;
		LogTransfer(msg.sender, to, value);
		return true;
	}

	function execute(uint256 units) external returns (bool) {
		return false;
	}

}
