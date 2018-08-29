( function( mw, $, d ) {
	eucc.ui.CallWidget = function( cfg ) {
		eucc.ui.CallWidget.parent.call( this, cfg );

		this.representative = cfg.representative;
		this.$callScript = cfg.callScriptContainer || $( '<div>' );
		this.$callScript.show();

		this.intro = new OO.ui.LabelWidget( {
			label: mw.message( 'eucc-call-intro' ).text()
		} );
		this.representativeName = new OO.ui.LabelWidget( {
			label: mw.message(
				'eucc-call-representative-label',
				this.representative.fullName
			).text()
		} );
		this.brusselsPhone = new OO.ui.LabelWidget( {
			label: mw.message(
				'eucc-call-representative-phone-brussels',
				this.representative.brusselsPhone
			).text()
		} );
		this.strasboughPhone = new OO.ui.LabelWidget( {
			label: mw.message(
				'eucc-call-represetntative-phone-strasbourg',
				this.representative.strasbourgPhone
			).text()
		} );
		this.callScriptLabel = new OO.ui.LabelWidget( {
			label: mw.message( 'eucc-call-script-label' ).text()
		} );
		this.callScriptLabel.$element.addClass( 'eucc-call-script-label' );

		this.$element.append(
			this.intro.$element,
			this.representativeName.$element,
			this.brusselsPhone.$element,
			this.strasboughPhone.$element,
			this.callScriptLabel.$element,
			this.$callScript
		);

		this.$element.addClass( 'eucc-call-widget' );
	};

	OO.inheritClass( eucc.ui.CallWidget, OO.ui.Widget );

} ) ( mediaWiki, jQuery, document );
