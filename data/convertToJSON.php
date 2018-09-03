<?php

if ( PHP_SAPI !== 'cli' && PHP_SAPI !== 'phpdbg' ) {
	die( "Command line only" );
}

$csvFile = __DIR__ . '/MEPS.csv';

$csvMap = [
	'firstName' => 1,
	'lastName' => 0,
	'email' => 11,
	'membershipInDelegations' => 8,
	'country' => 12,
	'gender' => 2,
	'brusselsPhone' => 14,
	'strasbourgPhone' => 15,
	// Dummy - do not have twitter name yet
	'twitter' => 1
];

$handle = fopen( $csvFile, 'r' );
$rawContent = [];

do {
	$row = fgetcsv( $handle, 0, ',' );
	if ( is_array( $row ) ) {
		$rawContent[] = $row;
	}
} while ( $row !== false );

fclose( $handle );

$dataByCountry = [];
foreach ( $rawContent as $row ) {
	$representative = [];
	$country = 'unknown';
	foreach ( $csvMap as $field => $index ) {
		$value = $row[ $index ];
		if ( $field === 'country' && !empty( $value ) ) {
			$country = $value;
			continue;
		}
		$representative[ $field ] = $value;
	}
	if ( !isset( $dataByCountry[$country] ) ) {
		$dataByCountry[$country] = [];
	}
	$dataByCountry[$country][] = $representative;
}

$destDir = './json';
if ( !file_exists( $destDir ) ) {
	mkdir( $destDir );
}
foreach ( $dataByCountry as $country => $meps ) {
	$data = [
		'representatives' => $meps
	];

	$jsonString = json_encode( $data, JSON_PRETTY_PRINT );
	$jsonString = str_replace( '    ', "\t", $jsonString );
	file_put_contents( "$destDir/$country.json", $jsonString );
}
