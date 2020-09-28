const constants = {
	// Use Vendor and Product ID representing the MiniDSP DDRC-24
	USB_VID: 0x2752,
	USB_PID: 0x0044,

	INPUT_ANALOG: 0,
	INPUT_TOSLINK: 1,
	INPUT_USB: 2,
	
	DIRAC_ON: 0x00,
	DIRAC_OFF: 0x01
};

module.exports = constants;
