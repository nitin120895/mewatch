import * as React from 'react';
import * as cx from 'classnames';

interface IconProps extends React.Props<any> {
	className?: string;
}

export default (props: IconProps) => {
	const { className } = props;
	return (
		<svg className={cx('svg-icon', className)} width="43px" height="29px" viewBox="0 0 43 29">
			<title>Responsive Web/Forms/5. Payment Types/MASTER</title>
			<desc>Created with Sketch.</desc>
			<g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
				<g id="Desktop---Ayden-Page" transform="translate(-572.000000, -335.000000)">
					<g id="Responsive-Web/Forms/5.-Payment-Types/MASTER" transform="translate(572.000000, 335.000000)">
						<g id="Group-6">
							<rect id="Rectangle-12" fill="#4770D6" x="0" y="0" width="43" height="29" rx="3" />
							<g id="Group-3" transform="translate(10.945455, 7.837838)">
								<ellipse id="Oval" fill="#D15454" cx="6.64545455" cy="6.66216216" rx="6.64545455" ry="6.66216216" />
								<path
									d="M15.2454545,0 C18.9156377,0 21.8909091,2.9827516 21.8909091,6.66216216 C21.8909091,10.3415727 18.9156377,13.3243243 15.2454545,13.3243243 C12.8675184,13.3243243 10.7812945,12.0722158 9.60699547,10.1897707 L11.7272727,10.1891892 L11.7272727,9.40540541 L9.18777774,9.40552565 C9.07346173,9.15223043 8.97448835,8.89048859 8.892046,8.6214915 L12.5090909,8.62162162 L12.5090909,7.83783784 L8.70303979,7.83722987 C8.65759301,7.58120379 8.62673353,7.32011814 8.6113536,7.05486744 L13.2909091,7.05405405 L13.2909091,6.27027027 L8.61131407,6.27013935 C8.6266982,6.00435007 8.65762475,5.74274179 8.70319607,5.48621439 L12.5090909,5.48648649 L12.5090909,4.7027027 L8.89235164,4.70183584 C8.97484143,4.43283519 9.07386342,4.17109241 9.18822892,3.91779918 L11.7272727,3.91891892 L11.7272727,3.13513514 L9.60671307,3.13500632 C10.78096,1.25230928 12.8673278,0 15.2454545,0 Z"
									id="Combined-Shape"
									fill="#FFB450"
								/>
							</g>
						</g>
					</g>
				</g>
			</g>
		</svg>
	);
};
