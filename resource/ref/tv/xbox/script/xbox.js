if (
	window.Windows &&
	Windows.Foundation.Metadata.ApiInformation.isTypePresent('Windows.UI.ViewManagement.ApplicationViewBoundsMode') &&
	Windows.System.Profile.AnalyticsInfo.versionInfo.deviceFamily === 'Windows.Xbox'
) {
	var AppView = Windows.UI.ViewManagement.ApplicationView.getForCurrentView();
	AppView.setDesiredBoundsMode(Windows.UI.ViewManagement.ApplicationViewBoundsMode.useCoreWindow);
}

if (window.navigator && typeof window.navigator.gamepadInputEmulation === 'string') {
	// We want the gamepad to provide gamepad VK keyboard events rather than moving a
	// mouse like cursor. Set to "keyboard", the gamepad will provide such keyboard events
	// and provide input to the DOM navigator.getGamepads API.
	window.navigator.gamepadInputEmulation = 'keyboard';
}
