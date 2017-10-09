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

	event Updated(address indexed _from, uint256 _current_count, uint256 _increase);

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
		uint256 increase = measurement - devices[msg.sender].count;
		devices[msg.sender].count = measurement;
		Updated(msg.sender, devices[msg.sender].count, increase);
		return devices[msg.sender].count;
	}

	function getCount(address device_address) external returns (uint256 count) {
		require(register_list[device_address]);
		return devices[device_address].count;
	}

	function getSerial(address device_address) external returns (string serial) {
		require(register_list[device_address]);
		return devices[device_address].serial;
	}

	function getCreatedAt(address device_address) external returns (uint256 serial) {
		require(register_list[device_address]);
		return devices[device_address].created_at;
	}

}
