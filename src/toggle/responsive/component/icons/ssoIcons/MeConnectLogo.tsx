import * as React from 'react';
import * as cx from 'classnames';

interface IconProps extends React.Props<any> {
	className?: string;
	height?: number;
	width?: number;
}

export default (props: IconProps) => {
	const { className, height = 60, width = 238 } = props;
	return (
		<svg
			className={cx('svg-icon', className)}
			width={width}
			height={height}
			viewBox="0 0 159 40"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M0 19.9833C0 8.94588 8.94241 0 19.9756 0C31.0088 0 39.9512 8.94588 39.9512 19.9833C39.9512 31.0208 31.0088 39.9667 19.9756 39.9667C8.94241 39.9667 0 31.0208 0 19.9833ZM26.9538 18.5379L23.7443 12.6428L20.5815 18.5379H26.9538ZM11.6524 18.5379L8.46966 12.6894L5.30019 18.5379H11.6524ZM1.54478 25.4654H8.28322L12.0187 19.2173H4.92732L1.54478 25.4654ZM8.86917 11.9367L8.84919 11.9767L12.4182 18.5379H19.4895L15.9472 11.9367H8.86917ZM16.4133 25.4654H20.0289L20.0222 25.4588H23.2916L20.0222 19.5304V19.5437L19.8491 19.2173H12.7844L12.8443 19.3239L16.4133 25.4654ZM20.6348 19.2173L23.8642 25.0858L27.2734 19.2173H20.6348ZM31.1886 11.9367H24.1239L27.7128 18.5379H34.7642L31.1886 11.9367ZM28.5784 20.1099L31.7745 25.4588H31.7812H38.5263L35.1437 19.2107H28.0924L28.5784 20.1099ZM47.0561 0.499596V16.5329H51.6904V7.29393C51.6904 6.54789 51.7969 5.91508 52.0034 5.40218C52.2098 4.88927 52.4961 4.50959 52.8623 4.25646C53.2285 4.01 53.6746 3.88344 54.194 3.88344C54.8599 3.88344 55.3659 4.08994 55.7122 4.49626C56.0584 4.90259 56.2315 5.50209 56.2315 6.29476V16.5396H60.8659V7.36054C60.8659 6.58785 60.9657 5.93506 61.1655 5.4155C61.3653 4.89593 61.6383 4.50292 61.9978 4.25646C62.3574 4.01 62.7835 3.88344 63.2829 3.88344C64.0154 3.88344 64.548 4.08327 64.881 4.47628C65.2139 4.87595 65.3804 5.48211 65.3804 6.29476V16.5396H70.0147V5.42882C70.0147 3.6503 69.5819 2.30476 68.7163 1.38552C67.844 0.46629 66.6188 0.00667318 65.0341 0.00667318C63.9954 0.00667318 63.0765 0.253134 62.2975 0.746057C61.5117 1.23898 60.8792 1.91841 60.3998 2.79768C60.0402 1.87845 59.4676 1.18569 58.6752 0.712751C57.8762 0.239812 56.9174 0.00667318 55.7921 0.00667318C54.8998 0.00667318 54.1075 0.219829 53.415 0.64614C52.7225 1.07245 52.1498 1.67195 51.6904 2.44464V0.499596H47.0561ZM79.7426 17.0391C78.0514 17.0391 76.5732 16.6794 75.3147 15.96C74.0496 15.2406 73.0774 14.2348 72.4049 12.9559C71.7258 11.6703 71.3862 10.2182 71.3862 8.58619C71.3862 6.95422 71.7124 5.49543 72.3583 4.20318C73.0042 2.91092 73.9564 1.88511 75.2082 1.1324C76.46 0.379696 77.9448 0.00667318 79.6561 0.00667318C81.3673 0.00667318 82.7057 0.359712 83.851 1.07245C84.9962 1.78519 85.8685 2.79102 86.4478 4.0966C87.0337 5.40218 87.3267 6.94089 87.3267 8.71941C87.3267 9.09243 87.3134 9.41883 87.2934 9.69193H75.8008C75.9473 10.9642 76.3668 11.8968 77.0526 12.4963C77.7451 13.0891 78.6573 13.3889 79.8092 13.3889C80.5816 13.3889 81.2341 13.2223 81.7668 12.8893C82.2995 12.5562 82.6724 12.0966 82.8788 11.5104H87.2002C86.8007 13.3489 85.9284 14.7344 84.5701 15.6603C83.2117 16.5862 81.607 17.0525 79.7493 17.0525L79.7426 17.0391ZM82.8721 6.70109C82.7656 5.70193 82.4327 4.95588 81.8734 4.46296C81.3074 3.97004 80.5683 3.72357 79.6494 3.72357C78.7305 3.72357 77.9182 3.97004 77.2723 4.46296C76.6264 4.95588 76.1737 5.70193 75.9273 6.70109H82.8721ZM50.8579 38.8543C52.143 39.587 53.6079 39.9534 55.2592 39.9534L55.2525 39.9667C56.6908 39.9667 57.9559 39.6869 59.0412 39.1341C60.1266 38.5812 60.9855 37.8285 61.6114 36.8759C62.2373 35.9234 62.6102 34.8576 62.7367 33.6653H58.1357C57.9492 34.3314 57.6163 34.8843 57.1369 35.3239C56.6575 35.7635 56.0183 35.9834 55.2259 35.9834C54.4735 35.9834 53.821 35.7769 53.2683 35.3705C52.7156 34.9575 52.2961 34.418 52.0032 33.7386C51.7102 33.0591 51.5637 32.2798 51.5637 31.4671C51.5637 30.6545 51.7102 29.8951 52.0032 29.1957C52.2895 28.4963 52.7156 27.9301 53.2683 27.5038C53.821 27.0774 54.4735 26.8643 55.2259 26.8643C56.0249 26.8643 56.6508 27.0841 57.1236 27.5237C57.5897 27.9634 57.9226 28.5362 58.109 29.249H62.7101C62.5836 27.9967 62.1841 26.8976 61.5182 25.9451C60.8457 24.9925 59.9734 24.2531 58.9014 23.7336C57.8227 23.2073 56.5976 22.9475 55.2192 22.9475C53.548 22.9475 52.0764 23.3206 50.8046 24.0733C49.5329 24.826 48.5474 25.8518 47.8616 27.1574C47.1757 28.463 46.8295 29.9151 46.8295 31.5271C46.8295 33.1391 47.1824 34.5779 47.8815 35.8501C48.5807 37.1224 49.5728 38.1216 50.8579 38.8543ZM71.546 39.9867C69.9413 39.9867 68.4964 39.6336 67.2246 38.9209C65.9528 38.2082 64.954 37.2157 64.2349 35.9301C63.5158 34.6445 63.1562 33.1657 63.1562 31.5004C63.1562 29.8351 63.5091 28.3764 64.2216 27.0841C64.9341 25.7918 65.9262 24.7794 67.2113 24.0466C68.4964 23.3139 69.9546 22.9475 71.5793 22.9475C73.204 22.9475 74.6289 23.3139 75.9007 24.0466C77.1724 24.7794 78.1579 25.7918 78.8571 27.0841C79.5562 28.3764 79.9091 29.8485 79.9091 31.5004C79.9091 33.1524 79.5562 34.6178 78.8571 35.9034C78.1579 37.189 77.1724 38.1882 75.9007 38.9076C74.6289 39.627 73.1773 39.9867 71.546 39.9867ZM71.546 36.1032C72.2784 36.1032 72.9176 35.9234 73.4703 35.557C74.0229 35.1907 74.4424 34.6644 74.7354 33.9717C75.0284 33.2856 75.1749 32.4596 75.1749 31.5004C75.1749 30.5412 75.035 29.6819 74.7554 28.9759C74.4757 28.2764 74.0562 27.7436 73.5036 27.3772C72.9509 27.0108 72.2984 26.831 71.546 26.831C70.7936 26.831 70.141 27.0175 69.5884 27.3972C69.0357 27.7702 68.6096 28.3097 68.3232 29.0092C68.0303 29.7086 67.8838 30.5412 67.8838 31.5004C67.8838 32.4596 68.0303 33.2523 68.3232 33.945C68.6162 34.6311 69.0424 35.164 69.6083 35.5437C70.1743 35.9234 70.8202 36.1099 71.5526 36.1099L71.546 36.1032ZM81.5604 23.4471V39.4804H86.1947V30.7744C86.1947 30.0017 86.3279 29.3156 86.5876 28.7227C86.8473 28.1299 87.2068 27.6636 87.6663 27.3306C88.1257 26.9975 88.6584 26.831 89.2643 26.831C90.1632 26.831 90.8424 27.0974 91.3018 27.617C91.7613 28.1366 91.9877 28.9026 91.9877 29.9018V39.4871H96.622V29.6486C96.622 27.5637 96.116 25.9251 95.0906 24.7327C94.0651 23.5404 92.6469 22.9475 90.8291 22.9475C89.8037 22.9475 88.8981 23.174 88.1191 23.6203C87.34 24.0666 86.6941 24.6994 86.1947 25.5121V23.4471H81.5604ZM98.9392 39.4804V23.4471H103.574V25.5121C104.073 24.6994 104.719 24.0666 105.498 23.6203C106.277 23.174 107.182 22.9475 108.208 22.9475C110.026 22.9475 111.444 23.5404 112.469 24.7327C113.495 25.9251 114.001 27.5637 114.001 29.6486V39.4871H109.366V29.9018C109.366 28.9026 109.14 28.1366 108.681 27.617C108.221 27.0974 107.542 26.831 106.643 26.831C106.037 26.831 105.505 26.9975 105.045 27.3306C104.586 27.6636 104.226 28.1299 103.966 28.7227C103.707 29.3156 103.574 30.0017 103.574 30.7744V39.4804H98.9392ZM119.281 38.9076C120.539 39.627 122.018 39.9867 123.709 39.9867L123.716 40C125.573 40 127.178 39.5337 128.536 38.6078C129.895 37.6819 130.767 36.2964 131.167 34.458H126.845C126.639 35.0441 126.266 35.5038 125.733 35.8368C125.2 36.1699 124.548 36.3364 123.776 36.3364C122.624 36.3364 121.711 36.0367 121.019 35.4438C120.333 34.8443 119.914 33.9118 119.767 32.6395H131.26C131.28 32.3664 131.293 32.04 131.293 31.667C131.293 29.8884 131 28.3497 130.414 27.0441C129.835 25.7386 128.963 24.7327 127.817 24.02C126.672 23.3073 125.334 22.9542 123.622 22.9542C121.911 22.9542 120.426 23.3272 119.174 24.08C117.923 24.8327 116.971 25.8585 116.325 27.1507C115.679 28.443 115.352 29.9018 115.352 31.5337C115.352 33.1657 115.692 34.6178 116.371 35.9034C117.044 37.1824 118.016 38.1882 119.281 38.9076ZM125.84 27.4105C126.399 27.9034 126.732 28.6495 126.838 29.6486H119.894C120.14 28.6495 120.593 27.9034 121.239 27.4105C121.885 26.9176 122.697 26.6711 123.616 26.6711C124.535 26.6711 125.274 26.9176 125.84 27.4105ZM140.615 39.9534C138.964 39.9534 137.499 39.587 136.214 38.8543C134.929 38.1216 133.936 37.1224 133.237 35.8501C132.538 34.5779 132.185 33.1391 132.185 31.5271C132.185 29.9151 132.532 28.463 133.217 27.1574C133.903 25.8518 134.889 24.826 136.16 24.0733C137.432 23.3206 138.904 22.9475 140.575 22.9475C141.953 22.9475 143.178 23.2073 144.257 23.7336C145.329 24.2531 146.201 24.9925 146.874 25.9451C147.54 26.8976 147.939 27.9967 148.066 29.249H143.465C143.278 28.5362 142.945 27.9634 142.479 27.5237C142.007 27.0841 141.381 26.8643 140.582 26.8643C139.829 26.8643 139.177 27.0774 138.624 27.5038C138.071 27.9301 137.645 28.4963 137.359 29.1957C137.066 29.8951 136.919 30.6545 136.919 31.4671C136.919 32.2798 137.066 33.0591 137.359 33.7386C137.652 34.418 138.071 34.9575 138.624 35.3705C139.177 35.7769 139.829 35.9834 140.582 35.9834C141.374 35.9834 142.013 35.7635 142.493 35.3239C142.972 34.8843 143.305 34.3314 143.491 33.6653H148.092C147.966 34.8576 147.593 35.9234 146.967 36.8759C146.341 37.8285 145.482 38.5812 144.397 39.1341C143.312 39.6869 142.047 39.9667 140.608 39.9667L140.615 39.9534ZM151.741 38.6878C152.547 39.5337 153.879 39.9534 155.736 39.9534H155.73C156.589 39.9534 157.441 39.8202 158.3 39.5471V35.9434C157.674 36.03 157.201 36.07 156.888 36.07C156.349 36.07 155.923 35.9634 155.623 35.7436C155.324 35.5238 155.171 35.1974 155.171 34.7577V27.1441H158.333V23.4472H155.171V19.184H150.536V23.4472H148.159V27.1441H150.536V35.0042C150.536 36.6162 150.936 37.8418 151.741 38.6878Z"
				fill="#00BA00"
			/>
		</svg>
	);
};