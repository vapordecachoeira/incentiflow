pragma solidity ^0.4.0;


import './Program.sol';


contract Sponsorship is Program {

	struct Sponsorship {
		address receiver;
		uint256 wei_per_unit;
	}

	mapping (address => Sponsorship) public sponsorships;

	mapping (address => bool) private register_list;

	event NewSponsorship(address sponsor, address receiver, uint256 wei_per_unit);

	function sponsor(address receiver, uint256 wei_per_unit) external returns (bool){
		require(wei_per_unit > 0);
		Sponsorship memory new_sponsorship;
		new_sponsorship.receiver = receiver;
		new_sponsorship.wei_per_unit = wei_per_unit;
		sponsorships[msg.sender] = new_sponsorship;
		register_list[msg.sender] = true;
		NewSponsorship(msg.sender, receiver, wei_per_unit);
		return true;
	}

	function execute(uint256 units) external returns (bool) {
		require(register_list[msg.sender]);
		Sponsorship memory sponsorship = sponsorships[msg.sender];
		uint256 amount_to_pay = sponsorship.wei_per_unit * units;
		address to = sponsorship.receiver;
		return transfer(to, amount_to_pay);
	}

	function getSponsored() external returns (address) {
		require(register_list[msg.sender]);
		return sponsorships[msg.sender].receiver;
	}

	function getSponsoredWeiPerUnit() external returns (uint256) {
		require(register_list[msg.sender]);
		return sponsorships[msg.sender].wei_per_unit;
	}

}
