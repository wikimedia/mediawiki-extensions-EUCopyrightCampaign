( function( mw, $, d ) {
	eucc.ui.ContactWidget = function( cfg ) {
		this.representative = cfg.representative;
		this.country = cfg.country;
		this.countryNameOfficial = this.getCountryNameOfficial();

		eucc.ui.ContactWidget.parent.call( this, cfg );

		this.compiledText = '';
		this.dirty = false;

		this.makeTextComposition();
		this.makeButtons();

		this.$element.append(
			this.$textContainerOuter,
			this.buttonsLayout.$element
		);

		this.$element.addClass( 'eucc-contact-widget' );
	};

	OO.inheritClass( eucc.ui.ContactWidget, OO.ui.Widget );

	eucc.ui.ContactWidget.static.tagName = 'div';

	eucc.ui.ContactWidget.prototype.getCountryNameOfficial = function() {
		var countryName = this.country.name;
		var countryNames = countryName.split( '/' );
		if( countryNames.length > 1 ) {
			return countryNames[ 0 ].trim();
		}
		return countryName;
	};

	eucc.ui.ContactWidget.prototype.makeButtons = function() {
		this.sendMailButton = new OO.ui.ButtonWidget( {
			label: mw.message( 'eucc-contact-button-send-mail-label' ).text(),
			flags: [
				"primary",
				"progressive"
			]
		} );
		this.sendMailButton.on( 'click', function() {
			this.validate().done( function() {
				this.emit( 'generateEmail' );
			}.bind( this ) );
		}.bind( this ) );
		this.copyMailButton = new OO.ui.ButtonWidget( {
			label: mw.message( 'eucc-contact-button-copy-mail-label' ).text(),
			framed: false,
			flags: [
				"progressive"
			]
		} );
		this.copyMailButton.$element.on( 'click', function() {
			this.validate().done( function() {
				this.copyToClipboard();
			}.bind( this ) );
		}.bind( this ) );

		this.buttonsLayout = new OO.ui.HorizontalLayout( {
			items: [
				this.sendMailButton,
				this.copyMailButton
			]
		} );
	};

	eucc.ui.ContactWidget.prototype.makeTextComposition = function() {
		var greetingText, userInfo, firstPart, preIssueText,
			secondPart, outro, complimentaryClose;

		this.$textContainer = $( '<div>' ).addClass( 'eucc-contact-text-container' );
		this.$textContainerOuter = $( '<div>' ).addClass( 'eucc-contact-text-container-outer' );

		this.firstPartMessageKey = this.pickVariation( 'eucc-email-part-one', 3 );
		this.outroMessageKey = this.pickVariation( 'eucc-email-outro', 3 );
		this.issues = [ {
				labelKey: 'eucc-option-protect-public-domain-label',
				textKey: this.pickVariation( 'eucc-option-protect-public-domain-text', 3 )
			},{
				labelKey: 'eucc-option-freedom-of-panorama-label',
				textKey: this.pickVariation( 'eucc-option-freedom-of-panorama-text', 3 )
			},{
				labelKey: 'eucc-option-exception-for-ucg-label',
				textKey: this.pickVariation( 'eucc-option-exception-for-ucg-text', 3 )
			},{
				labelKey: 'eucc-option-exception-for-text-and-data-mining-label',
				textKey: this.pickVariation( 'eucc-option-exception-for-text-and-data-mining-text', 3 )
			} ];

		greetingText = mw.message(
			'eucc-email-greeting',
			this.representative.fullName
		).escaped();

		userInfo = mw.message(
			'eucc-email-user-info',
			'##FIRST_NAME##',
			'##LAST_NAME##',
			this.countryNameOfficial
		).escaped();

		// Not exactly the cleanest solution, doing double replacement, but i still think
		// its better than having complicated string operations
		userInfo = userInfo.replace( '##FIRST_NAME##', '<input name="first_name">' );
		userInfo = userInfo.replace( '##LAST_NAME##', '<input name="last_name">' );

		firstPart = mw.message( this.firstPartMessageKey ).escaped();
		preIssueText = mw.message( 'eucc-email-issues-intro' ).escaped();
		secondPart = mw.message( 'eucc-email-part-two' ).escaped();
		outro = mw.message( this.outroMessageKey ).escaped();
		complimentaryClose = mw.message( 'eucc-email-complimentary-close' ).escaped();

		this.makeInputs();
		this.makeNewsletterContainer();

		this.$textContainer.append(
			new OO.ui.HtmlSnippet( '<p>' + greetingText + '</p>').toString(),
			new OO.ui.HtmlSnippet( '<p>' + userInfo + '</p>').toString(),
			this.customTextWidget.$element,
			new OO.ui.HtmlSnippet( '<p>' + firstPart + '</p>').toString(),
			new OO.ui.HtmlSnippet( '<p>' + preIssueText + '</p>').toString(),
			this.issueSelector.$element,
			new OO.ui.HtmlSnippet( '<p>' + secondPart + '</p>').toString(),
			new OO.ui.HtmlSnippet( '<p>' + outro + '</p>').toString(),
			new OO.ui.HtmlSnippet( '<p>' + complimentaryClose + '</p>').toString(),
			this.emailInput.$element,
			this.$newsletterContainer
		);

		this.$textContainer.find( 'input[name="first_name"]' ).replaceWith( this.firstNameInput.$element );
		this.$textContainer.find( 'input[name="last_name"]' ).replaceWith( this.lastNameInput.$element );

		this.$textContainerOuter.append( this.$textContainer );
	};

	eucc.ui.ContactWidget.prototype.makeInputs = function() {
		this.firstNameInput = new OO.ui.TextInputWidget( {
			placeholder: mw.message( 'eucc-email-first-name-input-placeholder' ).text(),
			required: true,
			name: 'first_name'
		} );
		this.firstNameInput.on( 'change', this.onInputChange.bind( this ) );
		this.lastNameInput = new OO.ui.TextInputWidget( {
			placeholder: mw.message( 'eucc-email-last-name-input-placeholder' ).text(),
			required: true,
			name: 'last_name'
		} );
		this.lastNameInput.on( 'change', this.onInputChange.bind( this ) );
		this.customTextWidget = new OO.ui.MultilineTextInputWidget( {
			autosize: true,
			placeholder: mw.message( 'eucc-email-custom-text-placeholder' ).text(),
		} );
		this.customTextWidget.$element.addClass( 'eucc-multiline-text-input' );
		this.customTextWidget.on( 'change', this.onInputChange.bind( this ) );

		var issueSelectorItems = [];
		var first = true;
		for( var idx in this.issues ) {
			var issue = this.issues[ idx ];
			issueSelectorItems.push(
				new eucc.ui.CheckboxMultioptionTextWidget( {
					data: mw.message( issue.labelKey ).escaped(),
					label: mw.message( issue.labelKey ).escaped(),
					contentText: mw.message( issue.textKey ).escaped(),
					selected: first || false
				} )
			);
			first = false;
		}
		this.issueSelector = new OO.ui.CheckboxMultiselectWidget( {
			items: issueSelectorItems
		} );
		this.issueSelector.on( 'change', this.onInputChange.bind( this ) );

		this.emailInput = new OO.ui.TextInputWidget( {
			type: 'email',
			name: 'email',
			required: true,
			placeholder: mw.message( 'eucc-email-email-input-placeholder' ).text(),
		} );
		this.emailInput.on( 'change', this.onInputChange.bind( this ) );
	};

	eucc.ui.ContactWidget.prototype.makeNewsletterContainer = function() {
		this.newsletterCheckbox = new OO.ui.CheckboxInputWidget( {
			selected: false,
			name: 'newsletter'
		} );
		this.newsletterCheckbox.on( 'change', this.onInputChange.bind( this ) );

		this.newsletterLabel = new OO.ui.LabelWidget( {
			label: mw.message( 'eucc-email-newsletter-label' ).text(),
			input: this.newsletterCheckbox
		} );
		this.$privacyPolicyLink = $( '<a>' )
			.attr( 'href', mw.config.get( 'euccPrivacyPolicyURL' ) )
			.html( mw.message( 'eucc-email-privacy-policy-label' ).escaped() );

		this.$newsletterContainer = $( '<div>' )
			.addClass( 'eucc-email-newsletter-container' )
			.append(
				this.newsletterCheckbox.$element,
				this.newsletterLabel.$element,
				this.$privacyPolicyLink
			);
	};

	eucc.ui.ContactWidget.prototype.onInputChange = function() {
		this.dirty = true;
	};

	eucc.ui.ContactWidget.prototype.isDirty = function() {
		return this.dirty;
	};

	eucc.ui.ContactWidget.prototype.getSelectedIssues = function() {
		var selected = this.issueSelector.items.filter( function ( item ) {
			return item.isSelected();
		} );

		var selectedIssues = [];
		for( var idx in selected ) {
			selectedIssues.push( {
				header: selected[ idx ].data,
				text: selected[ idx ].getText()
			} );
		}

		return selectedIssues;
	};

	eucc.ui.ContactWidget.prototype.validate = function() {
		var dfd = $.Deferred();

		var inputsToValidate = [
			this.firstNameInput,
			this.lastNameInput,
			this.emailInput
		];

		this.validateInternaly( inputsToValidate, dfd );

		return dfd.promise();
	};

	eucc.ui.ContactWidget.prototype.validateInternaly = function( inputsToValidate, dfd ) {
		if( inputsToValidate.length === 0 ) {
			return dfd.resolve();
		}

		inputsToValidate[ 0 ].getValidity()
			.done( function() {
				inputsToValidate.splice( 0, 1 );
				this.validateInternaly( inputsToValidate, dfd );
			}.bind( this ) )
			.fail( function() {
				inputsToValidate[ 0 ].focus();
				inputsToValidate[ 0 ].setValidityFlag( false );
				dfd.reject();
			} );
	};

	eucc.ui.ContactWidget.prototype.getUserInfo = function() {
		return {
			firstName: this.firstNameInput.getValue(),
			lastName: this.lastNameInput.getValue(),
			emailAddress: this.emailInput.getValue(),
			country: this.country,
			newsletterSignup: this.newsletterCheckbox.isSelected(),
			emailText: this.getCompiledText(),
			freeText: this.customTextWidget.getValue(),
			selectedIssues: this.getSelectedIssues(),
			selectedRepresentative: this.representative,
		};
	};

	eucc.ui.ContactWidget.prototype.getCompiledText = function() {
		var greetingText, userInfo, firstPart, preIssueText,
			secondPart, outro, complimentaryClose;

		this.compiledText = '';

		greetingText = mw.message(
			'eucc-email-greeting',
			this.representative.fullName
		).text();
		this.addParagraph( greetingText );

		userInfo = mw.message(
			'eucc-email-user-info',
			this.firstNameInput.getValue(),
			this.lastNameInput.getValue(),
			this.countryNameOfficial
		).text();
		this.addParagraph( userInfo );

		if( this.customTextWidget.getValue() ) {
			this.addParagraph( this.customTextWidget.getValue() );
		}

		firstPart = mw.message( this.firstPartMessageKey ).text();
		preIssueText = mw.message( 'eucc-email-issues-intro' ).text();
		secondPart = mw.message( 'eucc-email-part-two' ).text();
		outro = mw.message( this.outroMessageKey ).text();
		complimentaryClose = mw.message( 'eucc-email-complimentary-close' ).text();

		this.addParagraph( firstPart );
		this.addParagraph( preIssueText );

		var selectedIssues = this.getSelectedIssues();
		for( var idx in selectedIssues ) {
			this.addParagraph( selectedIssues[ idx ].text );
		}

		this.addParagraph( secondPart );
		this.addParagraph( outro );
		this.addParagraph( complimentaryClose );
		this.addParagraph( this.emailInput.getValue() );

		// When text is compiled, form is considered clean
		this.dirty = false;

		return this.compiledText;
	};

	eucc.ui.ContactWidget.prototype.addParagraph = function( text ) {
		this.compiledText += text + "\n\n";
	};

	eucc.ui.ContactWidget.prototype.getMailtoLink = function() {
		var link = "mailto:" + this.representative.email;
		// Do we want to pre-fill the subject or to let user fill it?
		//link += "?subject=" + this.emailSubject;
		link += "?body=" + this.getTextForEmailClient();

		return link;
	};

	eucc.ui.ContactWidget.prototype.getTextForEmailClient = function() {
		// In mailto: only allowed link break character is "%0D%0A"
		// https://tools.ietf.org/html/rfc2368#page-3
		var emailText = this.getCompiledText();
		return emailText.replace( new RegExp( "\n", 'g' ), "%0D%0A" );
	};

	eucc.ui.ContactWidget.prototype.copyToClipboard = function() {
		var emailText = this.getCompiledText();

		if( !navigator.clipboard ) {
			this.emit( 'copyEmail', this.copyToClipboardFallback( emailText ) );
			return;
		}

		// This method works without appending any elements to the DOM,
		// but is supported on only few browsers, and only if content is
		// served over https
		var writePromise = navigator.clipboard.writeText( emailText );
		writePromise.then( function() {
			this.emit( 'copyEmail', true );
		}.bind( this ), function() {
			this.emit( 'copyEmail', this.copyToClipboardFallback( emailText ) );
		}.bind( this ) );
	};

	/**
	 * Fail-safe way to do it. Supported on almost all browsers
	 *
	 * @param string text Text of the email
	 * @returns boolean
	 */
	eucc.ui.ContactWidget.prototype.copyToClipboardFallback = function( text ) {
		var $dummyTextArea = $( '<textarea>' ).val( text );
		$dummyTextArea.insertAfter( '.eucc-content-layout' );
		$dummyTextArea.focus();
		$dummyTextArea.select();

		var success = false;
		try {
			success = document.execCommand( 'copy' );
		} catch (err) {
			//We must catch any errors, so that text area always gets removed
		}

		$dummyTextArea.remove();

		return success;
	};

	eucc.ui.ContactWidget.prototype.addCopyToClipboardMessage = function( success ) {
		var message;
		if( success ) {
			message = mw.message( 'eucc-copy-to-clipboard-success' ).escaped();
		} else {
			message = mw.message( 'eucc-copy-to-clipboard-fail' ).escaped();
		}

		if( this.copyToClipboardStatus === undefined ) {
			this.copyToClipboardStatus = new OO.ui.LabelWidget();
			this.copyToClipboardStatus.$element.addClass( 'eucc-copy-to-clipboard-status' );
			this.buttonsLayout.$element.append( this.copyToClipboardStatus.$element );
		}

		this.copyToClipboardStatus.setLabel( message );
		this.copyToClipboardStatus.$element.show();
		setTimeout( function() {
			this.copyToClipboardStatus.$element.fadeOut( 500 );
		}.bind( this ), 2000 );
	};

	eucc.ui.ContactWidget.prototype.pickVariation = function( baseMsgKey, numberOfVariations ) {
		var variationNumber = Math.floor( Math.random() * ( numberOfVariations ) ) + 1;
		return baseMsgKey + '-v' + variationNumber;
	}

} ) ( mediaWiki, jQuery, document );
