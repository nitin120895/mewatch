const CreateAccountMockData = {
	email: `teste.email-${new Date().getTime()}@gmail.com`,
	password: '12345Aa?',
	firstName: 'Test First Name',
	lastName: 'Test Last Name',
	dateOfBirth: '02/01/1970',
	gender: 'preferNotToSay'
};

export const getMockedValue = (name: string) => {
	if (!_DEV_) return '';
	return CreateAccountMockData[name];
};
