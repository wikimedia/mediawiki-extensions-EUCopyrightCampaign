<?php

namespace EUCopyrightCampaign\Special;

class ContactYourMEP extends \IncludableSpecialPage {
	protected $countries = [
		'BE' => 'België / Belgique / Belgien',
		'BG' => 'България',
		'CZ' => 'Česko',
		'DK' => 'Danmark',
		'DE' => 'Deutschland',
		'EE' => 'Eesti',
		'IE' => 'Éire / Ireland',
		'GR' => 'Ελλάδα',
		'ES' => 'España / Espanya / Espainiako',
		'FR' => 'France',
		'HR' => 'Hrvatska',
		'IT' => 'Italia',
		'CY' => 'Κύπρος (Kípros) / Kıbrıs',
		'LV' => 'Latvija',
		'LT' => 'Lietuva',
		'LU' => 'Luxembourg / Luxemburg / Lëtzebuerg',
		'HU' => 'Magyarország',
		'MT' => 'Malta',
		'NL' => 'Nederland',
		'AT' => 'Österreich',
		'PL' => 'Polska',
		'PT' => 'Portugal',
		'RO' => 'România',
		'SI' => 'Slovenija',
		'SK' => 'Slovensko',
		'FI' => 'Suomi',
		'SE' => 'Sverige',
		'GB' => 'United Kingdom / Deyrnas Unedig / An Rìoghachd Aonaichte'
	];

	/**
	 * Constructor
	 */
	public function __construct() {
		parent::__construct( 'ContactYourMEP', '', false );
	}

	/**
	 * Displays ContactMEP special page
	 *
	 * @param string|null $subPage
	 */
	public function execute( $subPage ) {
		parent::execute( $subPage );

		$out = $this->getOutput();

		$out->addModules( 'ext.euCopyrightCampaign' );

		$out->addJsConfigVars( 'euccCountries', $this->countries );
		$out->addJsConfigVars(
			'euccNewsletterSubmitTarget',
			$this->getConfig()->get( 'EUCopyrightCampaignNewsletterSubmitTarget' )
		);
		$out->addJsConfigVars(
			'euccPrivacyPolicyURL',
			$this->getConfig()->get( 'EUCopyrightCampaignPrivacyPolicyURL' )
		);

		$out->enableOOUI();
		$out->addHTML( \Html::element( 'div', [ 'id' => 'eucc-form-container' ] ) );

		// Is this allowed?
		$out->addHTML( \Html::openElement( 'div', [
			'id' => 'eucc-call-script',
			'style' => 'display: none;'
		] ) );
		$out->addHTML( wfMessage( 'eucc-call-script-text' )->parseAsBlock() );
		$out->addHTML( \Html::closeElement( 'div' ) );
	}
}
