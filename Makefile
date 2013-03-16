default: run

SETTINGS = `pwd`/settings_test.js

run:
	@CAPTAINJS_SETTINGS=$(SETTINGS) node-dev index.js

test:
	@\
	CAPTAINJS_SETTINGS=$(SETTINGS) ./bin/captain.js syncdb --force &&\
	CAPTAINJS_SETTINGS=$(SETTINGS) ./bin/captain.js loaddata data &&\
	CAPTAINJS_SETTINGS=$(SETTINGS) mocha -G -b --recursive

.PHONY: test run
