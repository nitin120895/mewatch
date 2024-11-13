// show a full screen dialog
import CommonDialogComponent from '../component/CommonDialog';

let commonDialog: CommonDialogComponent;

const showDialog = (content: any) => {
	if (commonDialog) {
		commonDialog.show(content);
	}
};

const show = () => {
	if (commonDialog) {
		commonDialog.show();
	}
};

const hideDialog = () => {
	if (commonDialog) {
		return commonDialog.hide();
	}

	return false;
};

const setup = (dialog: CommonDialogComponent) => {
	commonDialog = dialog;
};

export const CommonDialog = {
	showDialog: showDialog,
	hideDialog: hideDialog,
	setup: setup,
	show: show
};
