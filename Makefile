default: run

SETTINGS = `pwd`/settings_test.js

run:
	@CAPTAINJS_SETTINGS=$(SETTINGS) node-dev index.js

test:
	@\
	CAPTAINJS_SETTINGS=$(SETTINGS) ./bin/captain syncdb --force &&\
	CAPTAINJS_SETTINGS=$(SETTINGS) ./bin/captain loaddata data &&\
	CAPTAINJS_SETTINGS=$(SETTINGS) mocha -G -b --recursive

.PHONY: test run
