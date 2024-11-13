'use strict';

const utils = require('./utils');

const template = (p, newrelic) =>
	`<!DOCTYPE html>
<html lang="${p.lang}">
	<head>
		<meta http-equiv="Content-Type" content="text/html, charset=UTF-8">
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=1">
		<meta property="og:site_name" content="mewatch">
		${utils.getMeta(p.meta).join('\n\t\t')}
		
		<!-- DTM HEAD -->
		<script type="text/javascript">
			const script = document.createElement('script');
			script.onload = () => window.adobeOnLoad && adobeOnLoad();
			script.src = "${process.env.CLIENT_DTM_SCRIPT_URL}";
			script.nonce="_";
			document.head.appendChild(script);
		</script>
		<!-- End DTM HEAD -->
		
		${
			process.env.CLIENT_MC_SSO_SESSION_SHARING_JS
				? `<script type="text/javascript" src="${process.env.CLIENT_MC_SSO_SESSION_SHARING_JS}" nonce="_" />`
				: ''
		} 
		
		<!-- DTM error safeguard -->
		<script type="text/javascript">var mcDataLayer = {};</script>

		<!-- Smart Banner -->
		<script type="text/javascript">
		!function(t,e,n,s,a,c,i,o,p){t.AppsFlyerSdkObject=a,t.AF=t.AF||function(){(t.AF.q=t.AF.q||[]).push([Date.now()].concat(Array.prototype.slice.call(arguments)))},t.AF.id=t.AF.id||i,t.AF.plugins={},o=e.createElement(n),p=e.getElementsByTagName(n)[0],o.nonce="_",o.async=1,o.src="https://websdk.appsflyer.com?"+(c.length>0?"st="+c.split(",").sort().join(",")+"&":"")+(i.length>0?"af_id="+i:""),p.parentNode.insertBefore(o,p)}(window,document,"script",0,"AF","banners",{banners: {key: "${
			process.env.CLIENT_APPSFLYER_SMART_BANNER_KEY
		}"}});
		AF('banners', 'showBanner',{ bannerZIndex: 20})
		</script>
		
		${newrelic ? newrelic.getBrowserTimingHeader() : ''}
		
		${(p.title || '').indexOf('<') === 0 ? p.title : `<title>${p.title}</title>`}
		${(p.links || []).join('\n\t\t')}
		${(p.styles || []).join('\n\t\t')}
		${(p.scripts || []).join('\n\t\t')}

		<!-- Google Tag Manager -->
		<script>
			window.dataLayer=[];
			(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
			new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
			j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
			'https://www.googletagmanager.com/gtm.js?id='+i+dl;j.nonce="_";f.parentNode.insertBefore(j,f);
			})(window,document,'script','dataLayer','${process.env.CLIENT_GTM_ID}');
		</script>
		<!-- End Google Tag Manager -->

		<!-- Conviva -->
		<script type="text/javascript" src="${process.env.CLIENT_PLAYER_CONVIVA_SCRIPT_URL}" nonce="_"></script>
		<!-- End Conviva -->

		<!-- Kaltura Web Video Player -->
		<script type="text/javascript" src="${process.env.CLIENT_KALTURA_PLAYER_CDN_URL}" nonce="_"></script>
		<!-- End Kaltura Web Video Player -->
		
		<script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization","url":"https://www.mewatch.sg","logo":"https://www.mewatch.sg/images/icons/logo.svg",
		"name":"mewatch","description":"Watch your favorite Mediacorp TV shows, comedy, entertainment, blockbuster Hollywood and Korean movies, LIVE programs, and sports. Stream on your mobile, tablet, computer, and Smart TV.","sameAs":["https://www.facebook.com/mewatch.mediacorp", "https://www.instagram.com/mewatch.mediacorp/", "https://www.youtube.com/user/ToggleMediacorp", "https://twitter.com/mewatch"],"contactPoint":{"@type":"ContactPoint","telephone":"+65 6333 3888","contactType":"customer support"},"address":{"@type":"PostalAddress","streetAddress":"1 Stars Avenue","addressLocality":"Singapore","addressCountry": "sg","postalCode":"138507"}}</script>
		
		<!-- Google IMA SDK, needs to be loaded first so player can access google.ima config -->
		<script type="text/javascript" src="//imasdk.googleapis.com/js/sdkloader/ima3.js" nonce="_"></script>
		
		<!-- recaptcha CDN-->
		<script src="https://www.google.com/recaptcha/api.js?render=explicit" nonce="_" async defer></script>
	</head>
	<body>
		<!-- Google Tag Manager (noscript) -->
		<noscript>
			<iframe src="https://www.googletagmanager.com/ns.html?id=${process.env.CLIENT_GTM_ID}"
			height="0" width="0" style="display:none;visibility:hidden"></iframe>
		</noscript>
		<!-- End Google Tag Manager (noscript) -->

		<div id="root">${p.body || ''}</div>
		
		${(p.bodyScripts || []).join('\n    ')}
		
		<!-- Google Analytics -->
		<script>
			(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function()
			{ (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
			m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;a.nonce="_";m.parentNode.insertBefore(a,m)
			})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
			ga('create', '${process.env.CLIENT_GA_ID}', 'auto');
		</script>
		<!-- End Google Analytics -->
		
		<!-- DTM FOOT -->
		<script type="text/javascript">
			if (typeof _satellite != "undefined") {
				_satellite.pageBottom();
			}else{
		    	window.adobeOnLoad = () => typeof _satellite != "undefined" && _satellite.pageBottom();	
			}

			window.googletag = window.googletag || {cmd: []};
			googletag.cmd.push(function() {
				googletag.pubads().setForceSafeFrame(true);
			});

		</script>
		<!-- END DTM FOOT -->
	</body>
</html>`;

module.exports = exports = function compile(config) {
	let params = config.htmlWebpackPlugin.options;
	params.bodyScripts = (params.bodyScripts || []).concat(utils.getManifestScripts(config.compilation.assets));
	return template(params);
};

exports.template = template;
