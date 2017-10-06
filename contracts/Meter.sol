pragma solidity ^0.4.0;


contract Meter {

	struct Device {
	address id;
	string serial;
	uint256 count;
	uint256 created_at; //unix_time_gmt;

	}

	mapping (address => Device) public devices;

	mapping (address => bool) private register_list;

	address public owner;

	event Updated(address indexed _from, uint256 _measurement);


	function Meter() public {
		owner = msg.sender;
	}

	// The owner can create a new device and associate it to a address
	function register(address device_address, string serial, uint256 created_at_unix_time_gmt) external returns (string) {
		require(msg.sender == owner);
		require(register_list[device_address] == false);
		// the requester should not have a device associated to it
		Device memory new_device;
		new_device.id = device_address;
		new_device.serial = serial;
		new_device.created_at = created_at_unix_time_gmt;
		devices[device_address] = new_device;
		register_list[device_address] = true;
		return serial;
	}

	// Update a Device counter if the sender is the registered owner of the device
	function update(uint256 measurement) external returns (uint256 count){
		require(register_list[msg.sender]);
		devices[msg.sender].count = measurement;
		Updated(msg.sender, devices[msg.sender].count);
		return devices[msg.sender].count;
	}

	function get_count(address device_address) external returns (uint256 count) {
		require(register_list[device_address]);
		return devices[device_address].count;
	}

	function get_serial(address device_address) external returns (string serial) {
		require(register_list[device_address]);
		return devices[device_address].serial;
	}

	function get_created_at(address device_address) external returns (uint256 serial) {
		require(register_list[device_address]);
		return devices[device_address].created_at;
	}

}
