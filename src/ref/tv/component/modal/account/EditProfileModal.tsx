import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Bem } from 'shared/util/styles';
import { Focusable } from 'ref/tv/focusableInterface';
import { DirectionalNavigation } from 'ref/tv/DirectionalNavigation';
import IntlFormatter from '../../IntlFormatter';
import CtaButton from '../../CtaButton';
import InputSingleLine from '../../InputSingleLine';
import { KEY_CODE } from 'ref/tv/util/keycodes';
import DeviceModel from 'shared/util/platforms/deviceModel';
import EnterPasswordModal from 'ref/tv/component/modal/EnterPasswordModal';
import './EditProfileModal.scss';

const standardIcon = require('../../../../../../resource/ref/tv/image/standard.png');
const kidsIcon = require('../../../../../../resource/ref/tv/image/kids.png');
const restrictedIcon = require('../../../../../../resource/ref/tv/image/restricted.png');

export type EditProfileState = 'start' | 'delete' | 'edit' | 'new' | 'createPin';

export type ProfileType = 'Standard' | 'Kids' | 'Restricted';

const useOSK = DeviceModel.hasOSK();
const bem = new Bem('edit-profile');
const maxLengthOfName = 20;

const profileStandard = {
	type: 'Standard',
	icon: standardIcon,
	title: '@{profile_standard|Standard}',
	desc: '@{profile_standard_desc|Access to all content}'
};
const profileKids = {
	type: 'Kids',
	icon: kidsIcon,
	title: '@{profile_kids|Kids}',
	desc: '@{profile_kids_desc|Kids content up to 12 years}'
};
const profileRestricted = {
	type: 'Restricted',
	icon: restrictedIcon,
	title: '@{profile_restricted|Restricted}',
	desc: '@{profile_restricted_desc|Requires PIN to use this profile}'
};

interface EditProfileModalProps extends React.HTMLProps<any> {
	baseState: EditProfileState;
	onBack: () => void;
	clearError: () => void;
	profile?: api.ProfileSummary;
	account?: api.Account;
	disableDelete?: boolean;
	newProfile?: (name: string, pinEnabled: boolean, tags: string[]) => any;
	editProfile?: (id: string, name: string, pinEnabled: boolean, tags: string[]) => any;
	deleteProfile?: (id: string) => any;
	url?: string;
	errorMsg?: string;
}

interface EditProfileModalState {
	curState: EditProfileState;
	curIndex: number;
	curValue: string;
	pinEnabled: boolean;
	curProfileType: ProfileType;
	errorMsg: string;
	pin?: number[];
	pinMsg?: string;
	showOSK?: boolean;
}

export class EditProfileModal extends React.Component<EditProfileModalProps, EditProfileModalState> {
	context: {
		focusNav: DirectionalNavigation;
	};

	static contextTypes: any = {
		focusNav: PropTypes.object.isRequired
	};

	private focusableRow: Focusable;
	private profileTypes = [];
	private prevState: EditProfileState;
	private enterPasswordModalRow: Focusable;

	constructor(props: EditProfileModalProps) {
		super(props);

		let curProfileType: ProfileType = 'Standard';
		const profile = props.profile;

		if (profile) {
			if (profile.pinEnabled) {
				curProfileType = 'Restricted';
			} else if (profile.segments && profile.segments.find(s => s === 'kids')) {
				curProfileType = 'Kids';
			}

			if (profile.id === props.account.primaryProfileId) {
				this.profileTypes = [profileStandard, profileRestricted];
			} else {
				this.profileTypes = [profileStandard, profileKids, profileRestricted];
			}
		} else {
			this.profileTypes = [profileStandard, profileKids, profileRestricted];
		}

		let curState = props.baseState;

		this.state = {
			curState: curState,
			curIndex: 0,
			curValue: (props.profile && props.profile.name) || '',
			pinEnabled: props.account.pinEnabled,
			curProfileType,
			errorMsg: ''
		};

		this.focusableRow = {
			focusable: true,
			index: -1,
			height: 0,
			ref: undefined,
			restoreSavedState: () => {},
			setFocus: this.setFocus,
			moveLeft: this.moveLeft,
			moveRight: this.moveRight,
			moveUp: this.moveUp,
			moveDown: this.moveDown,
			exec: this.exec
		};
	}

	componentWillReceiveProps(nextProps: EditProfileModalProps) {
		if (nextProps.errorMsg !== this.props.errorMsg) this.setState({ errorMsg: nextProps.errorMsg });
	}

	componentDidMount() {
		this.context.focusNav.setFocus(this.focusableRow);
	}

	componentWillUnmount() {
		this.context.focusNav.resetFocus();
	}

	private setFocus = (isFocused?: boolean): boolean => {
		return true;
	};

	private moveLeft = (): boolean => {
		const { disableDelete } = this.props;
		const { curState, curIndex, curProfileType } = this.state;

		if (curState === 'createPin') {
			return this.enterPasswordModalRow.moveLeft();
		}

		const disableSave = this.checkShouldDisableSave();
		let tarIndex = curIndex;
		let tarProfileType = curProfileType;

		switch (curState) {
			case 'start':
				if (!disableDelete && curIndex !== 0) {
					tarIndex = 0;
				} else {
					return true;
				}

				break;

			case 'delete':
				if (curIndex !== 0) {
					tarIndex = 0;
				} else {
					return true;
				}

				break;

			case 'new':
			case 'edit':
				const profileTypesCnt = this.profileTypes.length;

				if (curIndex < profileTypesCnt) {
					if (curIndex !== 0) {
						tarIndex = (curIndex - 1 + profileTypesCnt) % profileTypesCnt;
					} else {
						return true;
					}

					tarProfileType = this.profileTypes[tarIndex].type;
				} else if (curIndex > profileTypesCnt) {
					if (!disableSave) {
						if (curIndex !== profileTypesCnt + 1) {
							tarIndex = profileTypesCnt + 1;
						} else {
							return true;
						}
					}
				}

				break;
		}

		this.setState({ curIndex: tarIndex, curProfileType: tarProfileType });
		return true;
	};

	private moveRight = (): boolean => {
		const { disableDelete } = this.props;
		const { curState, curIndex, curProfileType } = this.state;

		if (curState === 'createPin') {
			return this.enterPasswordModalRow.moveRight();
		}

		const disableSave = this.checkShouldDisableSave();
		let tarIndex = curIndex;
		let tarProfileType = curProfileType;

		switch (curState) {
			case 'start':
				if (!disableDelete && curIndex !== 1) {
					tarIndex = 1;
				} else {
					return true;
				}

				break;

			case 'delete':
				if (curIndex !== 1) {
					tarIndex = 1;
				} else {
					return true;
				}

				break;

			case 'new':
			case 'edit':
				const profileTypesCnt = this.profileTypes.length;

				if (curIndex < profileTypesCnt) {
					if (curIndex + 1 < profileTypesCnt) {
						tarIndex = (curIndex + 1) % profileTypesCnt;
					} else {
						return true;
					}

					tarProfileType = this.profileTypes[tarIndex].type;

					if (tarProfileType === 'Restricted') {
						this.prevState = curState;

						if (!this.state.pinEnabled) {
							this.setState({ curState: 'createPin' });
						}
					}
				} else if (curIndex > profileTypesCnt) {
					if (!disableSave) {
						if (curIndex !== profileTypesCnt + 2) {
							tarIndex = profileTypesCnt + 2;
						} else {
							return true;
						}
					}
				}

				break;
		}

		this.setState({ curIndex: tarIndex, curProfileType: tarProfileType });
		return true;
	};

	private moveUp = (): boolean => {
		const { curState, curIndex, curProfileType } = this.state;

		if (curState === 'createPin') {
			return this.enterPasswordModalRow.moveUp();
		}

		if (curState === 'new' || curState === 'edit') {
			if (curIndex === this.profileTypes.length) {
				this.setState({ curIndex: this.profileTypes.findIndex(p => p.type === curProfileType), showOSK: false });
			} else if (curIndex > this.profileTypes.length) {
				this.props.clearError();
				// Focus on input
				this.setState({ curIndex: this.profileTypes.length, errorMsg: '' });
			}
		}

		return true;
	};

	private moveDown = (): boolean => {
		const { curState, curIndex } = this.state;

		if (curState === 'createPin') {
			return this.enterPasswordModalRow.moveDown();
		}

		const disableSave = this.checkShouldDisableSave();

		if (curState === 'new' || curState === 'edit') {
			if (curIndex < this.profileTypes.length) {
				this.setState({ curIndex: this.profileTypes.length, errorMsg: '' });
			} else if (curIndex === this.profileTypes.length) {
				if (disableSave) {
					// set focus on Cancel as Create/Edit is disabled
					this.setState({ curIndex: curIndex + 2, showOSK: false });
				} else {
					this.setState({ curIndex: curIndex + 1, showOSK: false });
				}
			}
		}

		return true;
	};

	private exec = (act?: string): boolean => {
		const { curState, curProfileType } = this.state;

		if (curState === 'createPin') {
			return this.enterPasswordModalRow.exec(act);
		}

		let curIndex = this.state.curIndex;

		switch (act) {
			case 'click':
				let nextState = curState;

				switch (curState) {
					case 'start':
						if (curIndex === 0) {
							// edit
							nextState = 'edit';
							curIndex = this.profileTypes.findIndex(p => p.type === curProfileType);
						} else {
							// delete
							nextState = 'delete';
						}
						break;

					case 'delete':
						if (curIndex === 0) {
							this.deleteProfile();
						} else {
							nextState = 'start';
							curIndex = 1;
						}
						break;

					case 'new':
					case 'edit':
						let inputIndex = this.profileTypes.length;

						if (curIndex === inputIndex) {
							// click on input control
							if (useOSK) {
								this.setState({ showOSK: true });
							}
						} else {
							if (useOSK) {
								this.setState({ showOSK: false });
							}
						}

						if (curIndex === inputIndex + 1) {
							// create or edit
							this.createOrEditProfile();
						} else if (curIndex === inputIndex + 2) {
							// cancel
							if (this.props.baseState === 'start') {
								nextState = 'start';
								curIndex = 0;
							} else this.props.onBack();
						}

						break;
				}

				this.setState({ curState: nextState, curIndex });
				return true;

			case 'esc':
				const { baseState } = this.props;

				if (baseState === curState) {
					this.props.onBack();
				} else {
					switch (curState) {
						case 'delete':
						case 'edit':
							this.setState({ curState: 'start', curIndex: curState === 'edit' ? 0 : 1 });
							break;

						default:
							this.props.onBack();
							break;
					}
				}

				this.setState({ showOSK: false });
				return true;

			case 'del':
				if (curState === 'new' || curState === 'edit') {
					if (curIndex === this.profileTypes.length) {
						let curValue = this.state.curValue;
						if (curValue.length > 0) {
							curValue = curValue.substr(0, curValue.length - 1);
						}
						this.setState({
							curValue
						});
					}
				}

				break;

			default:
				if (curState === 'new' || curState === 'edit') {
					this.onNameInput(act);
				}

				break;
		}

		return false;
	};

	private createOrEditProfile() {
		const { curState, curValue, curProfileType } = this.state;
		const { newProfile, editProfile, profile } = this.props;
		const name = curValue.trim();
		const pinEnabled = curProfileType === 'Restricted';
		const tags = curProfileType === 'Kids' ? ['kids'] : [];

		if (!name) {
			this.setState({ errorMsg: '@{profile_name_required|Profile name cannot be empty}' });
		}

		if (curState === 'new' && newProfile) {
			newProfile(name, pinEnabled, tags);
		} else if (curState === 'edit' && editProfile && profile) {
			editProfile(profile.id, name, pinEnabled, tags);
		}
	}

	private deleteProfile() {
		const { deleteProfile, profile } = this.props;

		if (profile && deleteProfile) {
			deleteProfile(profile.id);
		}
	}

	private checkShouldDisableSave() {
		const { curValue, pinEnabled, curProfileType } = this.state;
		return (!pinEnabled && curProfileType === 'Restricted') || !curValue || curValue.trim().length < 2;
	}

	private onNameInput = (act: string) => {
		const codeValue = act.charCodeAt(0);
		const { curValue } = this.state;

		if (!curValue) {
			if (act === ' ' || act === '　') {
				// could not start with space
				return;
			}
		}

		if (curValue.length < maxLengthOfName) {
			let newValue;

			if (codeValue >= KEY_CODE.CHAR_START && codeValue <= KEY_CODE.CHAR_END) {
				if (codeValue === KEY_CODE.SPACE) {
					newValue = curValue.trim() + act;
				} else {
					newValue = curValue + act;
				}

				this.setState({ curValue: newValue });
			}
		}
	};

	private onOSKValueChanged = (value: string) => {
		if (useOSK) {
			let { curValue } = this.state;

			if (!curValue) {
				if (value === ' ' || value === '　') {
					// could not start with space
					return;
				}
			}

			if (curValue.endsWith(' ') && value.endsWith(' ')) {
				// only one space is allowed
				return;
			}

			if (value.length <= maxLengthOfName) this.setState({ curValue: value });
		}
	};

	private onOSKBack = () => {
		this.setState({ showOSK: false });
	};

	private onOSKDone = () => {
		this.setState({ showOSK: false });

		setImmediate(() => {
			if (useOSK) {
				this.moveDown();
			}
		});
	};

	private handleMouseEnter = index => {
		this.setState({ curIndex: index });
	};

	private handleMouseEnterInput = () => {
		this.setState({ curIndex: this.profileTypes.length });
	};

	private handleMouseEnterProfileType = index => {
		const profileType = this.profileTypes[index].type;
		this.setState({ curIndex: index, curProfileType: profileType });
	};

	private handleMouseClickError = () => {
		this.setState({ errorMsg: '' });
	};

	private handleMouseClick = () => {
		this.exec('click');
	};

	render() {
		const { curState, curIndex, curValue, pinEnabled, curProfileType, errorMsg, showOSK } = this.state;
		const { disableDelete } = this.props;
		const curSelectedIndex = curProfileType && this.profileTypes.findIndex(p => p.type === curProfileType);
		const disableSave = this.checkShouldDisableSave();

		return (
			<div className={bem.b()}>
				{curState === 'start' && this.renderStart(curIndex, disableDelete)}
				{curState === 'delete' && this.renderDelete(curIndex)}
				{(curState === 'new' || curState === 'edit') &&
					this.renderNewProfile(
						curState,
						curIndex,
						curValue,
						curSelectedIndex,
						disableSave,
						pinEnabled,
						errorMsg,
						showOSK
					)}
				{curState === 'createPin' && this.renderPinMode()}
			</div>
		);
	}

	private renderStart(curIndex, disableDelete) {
		return (
			<div className={bem.e('container')}>
				<div className={bem.e('title')}>{this.props.profile && this.props.profile.name}</div>
				<div className={bem.e('buttons')}>
					<CtaButton
						className={bem.e('edit')}
						label={'@{profile_edit|Edit}'}
						focused={curIndex === 0}
						index={0}
						onMouseEnter={this.handleMouseEnter}
						onClick={this.handleMouseClick}
					/>
					<CtaButton
						className={bem.e('delete')}
						label={'@{profile_delete|Delete}'}
						focused={curIndex === 1}
						disabled={disableDelete}
						index={1}
						onMouseEnter={!disableDelete && this.handleMouseEnter}
						onClick={this.handleMouseClick}
					/>
				</div>
			</div>
		);
	}

	private renderDelete(curIndex) {
		return (
			<div className={bem.e('container')}>
				<IntlFormatter tagName="div" className={bem.e('title')}>
					{'@{profile_delete_title|DELETE PROFILE?}'}
				</IntlFormatter>

				<IntlFormatter tagName="div" className={bem.e('del-info')}>
					{
						'@{profile_delete_confirm|Are you sure you want to delete this profile? All data associated with this profile will be lost.}'
					}
				</IntlFormatter>

				<div className={bem.e('buttons')}>
					<CtaButton
						className={bem.e('delete')}
						label={'@{profile_delete|Delete}'}
						focused={curIndex === 0}
						index={0}
						onMouseEnter={this.handleMouseEnter}
						onClick={this.handleMouseClick}
					/>
					<CtaButton
						className={bem.e('cancel')}
						label={'@{cancel|Cancel}'}
						focused={curIndex === 1}
						index={1}
						onMouseEnter={this.handleMouseEnter}
						onClick={this.handleMouseClick}
					/>
				</div>
			</div>
		);
	}

	private renderNewProfile(curState, curIndex, curValue, curSelectedIndex, disableSave, pinEnabled, errorMsg, showOSK) {
		return (
			<div className={bem.e('container', { showOSK })}>
				{curState === 'new' && (
					<IntlFormatter tagName="div" className={bem.e('title')}>
						{'@{profile_new_title|NEW PROFILE}'}
					</IntlFormatter>
				)}
				{curState === 'edit' && (
					<IntlFormatter tagName="div" className={bem.e('title')}>
						{'@{profile_edit_title|EDIT PROFILE}'}
					</IntlFormatter>
				)}

				{this.renderProfileTypes(curIndex, curSelectedIndex)}

				{!pinEnabled && this.state.curProfileType === 'Restricted' && (
					<IntlFormatter tagName="div" className={bem.e('info')} args={{ URL: this.props.url }}>
						{'@{profile_edit_nopin|PIN required. Please go to $URL$ and create a PIN before proceeding.}'}
					</IntlFormatter>
				)}

				<div className={bem.e('input')}>
					<InputSingleLine
						focused={curIndex === this.profileTypes.length}
						value={curValue}
						useOSK={useOSK}
						showOSK={showOSK}
						maxLength={maxLengthOfName}
						placeholder={'profile_edit_placeholder'}
						error={errorMsg}
						valueChanged={this.onOSKValueChanged}
						onBack={this.onOSKBack}
						onDone={this.onOSKDone}
						clearError={this.props.clearError}
						onMouseEnter={this.handleMouseEnterInput}
					/>

					{errorMsg && (
						<IntlFormatter tagName="div" className={bem.e('error')} onClick={this.handleMouseClickError}>
							{errorMsg}
						</IntlFormatter>
					)}
				</div>

				<div className={bem.e('buttons')}>
					{curState === 'new' && (
						<CtaButton
							className={bem.e('create')}
							label={'@{profile_create_button|Create New Profile}'}
							disabled={disableSave}
							focused={curIndex === this.profileTypes.length + 1}
							index={this.profileTypes.length + 1}
							onMouseEnter={!disableSave && this.handleMouseEnter}
							onClick={this.handleMouseClick}
						/>
					)}
					{curState === 'edit' && (
						<CtaButton
							className={bem.e('create')}
							label={'@{profile_saveChanges|Save Changes}'}
							disabled={disableSave}
							focused={curIndex === this.profileTypes.length + 1}
							index={this.profileTypes.length + 1}
							onMouseEnter={!disableSave && this.handleMouseEnter}
							onClick={this.handleMouseClick}
						/>
					)}

					<CtaButton
						className={bem.e('cancel')}
						label={'@{cancel|Cancel}'}
						focused={curIndex === this.profileTypes.length + 2}
						index={this.profileTypes.length + 2}
						onMouseEnter={this.handleMouseEnter}
						onClick={this.handleMouseClick}
					/>
				</div>
			</div>
		);
	}

	private renderPinMode() {
		return (
			<EnterPasswordModal
				isEditingProfile={true}
				close={this.onPinCreateEnd}
				focusable={false}
				onFocusableRowCreated={row => (this.enterPasswordModalRow = row)}
			/>
		);
	}

	private onPinCreateEnd = (isSuc: boolean) => {
		this.setState({ curState: this.prevState, pinEnabled: isSuc });

		setImmediate(() => {
			if (!isSuc) {
				this.moveLeft();
			} else {
				this.moveDown();
			}
		});
	};

	private renderProfileTypes(curIndex, curSelectedIndex) {
		return (
			<div className={bem.e('types')}>
				{this.profileTypes.map((t, i) => {
					return (
						<ProfileTypeItem
							key={'type-' + i}
							className={bem.e('type', { focused: curIndex === i, selected: curSelectedIndex === i })}
							index={i}
							item={t}
							onMouseEnter={this.handleMouseEnterProfileType}
						/>
					);
				})}
			</div>
		);
	}
}

interface ProfileTypeItemProps extends React.HTMLProps<any> {
	className: string;
	index: number;
	item: any;
	onMouseEnter?: (index) => void;
}

class ProfileTypeItem extends React.Component<ProfileTypeItemProps, any> {
	private handleMouseEnter = () => {
		const { onMouseEnter, index } = this.props;
		onMouseEnter && onMouseEnter(index);
	};

	render(): any {
		const { className, item } = this.props;

		return (
			<div className={className} onMouseEnter={this.handleMouseEnter}>
				<div className={bem.e('type-icon')}>
					<img src={item.icon} />
				</div>
				<IntlFormatter tagName="div" className={bem.e('type-title')}>
					{item.title}
				</IntlFormatter>
				<IntlFormatter tagName="div" className={bem.e('type-desc')}>
					{item.desc}
				</IntlFormatter>
			</div>
		);
	}
}
